import { useState } from "react";
import { Link } from "wouter";
import { useGetCourses, useListQuizzes } from "@workspace/api-client-react";
import { Heart, BookOpen, Brain, PlayCircle, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { getFavorites, toggleFavorite } from "@/lib/auth";
import { motion } from "framer-motion";

export default function FavoritesPage() {
  const [favs, setFavs] = useState(() => getFavorites());
  const { data: courses } = useGetCourses();
  const { data: quizzesData } = useListQuizzes({});

  const favCourses = (Array.isArray(courses) ? courses : []).filter((c) => favs.courses.includes(c.rowId));
  const favQuizzes = ((quizzesData as { quizzes?: { examId: string; name: string; questionCount: number }[] })?.quizzes ?? []).filter((q) => favs.quizzes.includes(q.examId));
  const total = favs.courses.length + favs.quizzes.length + favs.sessions.length;

  function removeCourse(id: string) {
    toggleFavorite("courses", id);
    setFavs(getFavorites());
  }

  function removeQuiz(id: string) {
    toggleFavorite("quizzes", id);
    setFavs(getFavorites());
  }

  function removeSession(id: string) {
    toggleFavorite("sessions", id);
    setFavs(getFavorites());
  }

  return (
    <Layout>
      <div className="tnc-brand-gradient text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart size={22} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black">My Favorites</h1>
          </div>
          <p className="text-white/70 text-sm ml-[52px]">{total} saved item{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {total === 0 && (
          <div className="text-center py-24">
            <Heart size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="font-bold text-gray-500 text-lg mb-2">No favorites yet</p>
            <p className="text-sm text-gray-400 mb-6">Tap the ♥ heart on any course, quiz, or video to save it here.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/courses" className="px-5 py-2.5 rounded-xl tnc-brand-gradient text-white text-sm font-semibold">Browse Courses</Link>
              <Link href="/quiz" className="px-5 py-2.5 rounded-xl border border-blue-600 text-blue-600 text-sm font-semibold">Browse Quizzes</Link>
            </div>
          </div>
        )}

        {favCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-600" />
              <h2 className="font-black text-gray-900 text-lg">Courses ({favCourses.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favCourses.map((course, i) => (
                <motion.div
                  key={course.rowId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen size={32} className="text-blue-200" /></div>
                    )}
                    <button
                      onClick={() => removeCourse(course.rowId)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-red-400 hover:text-red-600 hover:bg-white transition-colors"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-900 line-clamp-2 mb-2">{course.name}</p>
                    <Link href={`/courses/${course.rowId}`} className="block text-center py-1.5 rounded-lg tnc-brand-gradient text-white text-xs font-semibold">Open Course</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {favQuizzes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-purple-600" />
              <h2 className="font-black text-gray-900 text-lg">Quizzes ({favQuizzes.length})</h2>
            </div>
            <div className="space-y-3">
              {favQuizzes.map((quiz, i) => (
                <motion.div
                  key={quiz.examId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Brain size={22} className="text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{quiz.name}</p>
                    <p className="text-xs text-gray-400">{quiz.questionCount} questions</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => removeQuiz(quiz.examId)} className="p-1.5 rounded-full text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                    <Link href={`/quiz/${quiz.examId}`} className="px-3 py-1.5 rounded-lg tnc-brand-gradient text-white text-xs font-semibold">Take Quiz</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {favs.sessions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle size={18} className="text-green-600" />
              <h2 className="font-black text-gray-900 text-lg">Saved Videos ({favs.sessions.length})</h2>
            </div>
            <div className="space-y-3">
              {favs.sessions.map((sessionId, i) => (
                <motion.div
                  key={sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <PlayCircle size={22} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">Saved Video</p>
                    <p className="text-xs text-gray-400 truncate">{sessionId}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => removeSession(sessionId)} className="p-1.5 rounded-full text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                    <Link href={`/watch/${sessionId}`} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold">Watch</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
