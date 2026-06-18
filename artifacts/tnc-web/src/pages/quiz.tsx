import { useState } from "react";
import { Link } from "wouter";
import { useListQuizzes, getListQuizzesQueryKey } from "@workspace/api-client-react";
import { Brain, Clock, Target, ChevronRight, TrendingUp, Award, Search, AlertCircle, Heart } from "lucide-react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { isFavorite, toggleFavorite } from "@/lib/auth";

function formatDuration(mins: string) {
  const n = parseInt(mins);
  if (!n) return "—";
  if (n >= 60) return `${Math.floor(n / 60)}h ${n % 60 > 0 ? `${n % 60}m` : ""}`.trim();
  return `${n} min`;
}

function getDifficultyColor(maxMarks: number) {
  if (maxMarks >= 100) return "bg-red-100 text-red-700";
  if (maxMarks >= 50) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function getDifficultyLabel(maxMarks: number) {
  if (maxMarks >= 100) return "Hard";
  if (maxMarks >= 50) return "Medium";
  return "Easy";
}

export default function QuizPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [, rerender] = useState(0);
  const limit = 20;

  const { data, isLoading } = useListQuizzes(
    { page, limit },
    { query: { queryKey: getListQuizzesQueryKey({ page, limit }) } }
  );

  const quizzes = data?.quizzes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const filtered = search
    ? quizzes.filter((q) => q.name.toLowerCase().includes(search.toLowerCase()))
    : quizzes;

  return (
    <Layout>
      {/* Header */}
      <div className="tnc-brand-gradient text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain size={22} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Question Bank</h1>
          </div>
          <p className="text-white/70 text-sm ml-[52px]">
            {total > 0 ? `${total.toLocaleString()} mock tests — practice for NORCET, AIIMS, PGIMER & more` : "Practice with real exam questions"}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6 text-sm text-gray-500 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp size={15} className="text-blue-500" />
            <span><strong className="text-gray-900">{total.toLocaleString()}</strong> tests</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Target size={15} className="text-green-500" />
            <span>Negative marking</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Award size={15} className="text-amber-500" />
            <span>Instant results & explanations</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">{search ? "No quizzes match your search" : "No quizzes available"}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((quiz, i) => (
                <motion.div
                  key={quiz.examId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/quiz/${quiz.examId}`} className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {quiz.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getDifficultyColor(quiz.maxMarks)}`}>
                            {getDifficultyLabel(quiz.maxMarks)}
                          </span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Target size={11} /> {quiz.questionCount} Qs
                          </span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock size={11} /> {formatDuration(quiz.durationMinutes)}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {quiz.maxMarks} marks
                          </span>
                        </div>
                        {quiz.negativeMarks > 0 && (
                          <p className="text-[11px] text-red-500 mt-1">
                            −{quiz.negativeMarks} per wrong answer
                          </p>
                        )}
                      </Link>
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.preventDefault(); toggleFavorite("quizzes", quiz.examId); rerender((n) => n + 1); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title={isFavorite("quizzes", quiz.examId) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart size={16} className={isFavorite("quizzes", quiz.examId) ? "fill-red-500 text-red-500" : "text-gray-300"} />
                        </button>
                        <Link href={`/quiz/${quiz.examId}`}>
                          <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                            <ChevronRight size={18} className="text-blue-600 group-hover:text-white transition-colors" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {!search && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
