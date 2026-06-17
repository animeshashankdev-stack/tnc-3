import { useGetCourses, useGetPromoStatus, useGetUserPurchases, getGetUserPurchasesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BookOpen, Lock, Unlock, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/Layout";
import { getUser } from "@/lib/auth";
import { motion } from "framer-motion";

export default function CoursesPage() {
  const user = getUser();
  const [search, setSearch] = useState("");

  const { data: courses, isLoading } = useGetCourses();
  const { data: promo } = useGetPromoStatus();
  const { data: purchases } = useGetUserPurchases(user?.userId ?? "", {
    query: { enabled: !!user, queryKey: getGetUserPurchasesQueryKey(user?.userId ?? "") },
  });

  const purchasedCourseIds = new Set((purchases ?? []).map((p) => p.courseId));

  const filtered = (courses ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function isUnlocked(courseRowId: string) {
    return promo?.enabled || purchasedCourseIds.has(courseRowId);
  }

  return (
    <Layout>
      {/* Header */}
      <div className="tnc-brand-gradient text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-2">All Courses</h1>
          <p className="text-white/70 text-sm">Choose a batch and start your exam preparation</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b sticky top-16 md:top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="input-search-courses"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border">
                <div className="h-44 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-full" />
                  <div className="h-9 skeleton rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BookOpen size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="font-medium">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course, i) => {
              const unlocked = isUnlocked(course.rowId);
              return (
                <motion.div
                  key={course.rowId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group flex flex-col"
                  data-testid={`card-course-${course.rowId}`}
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={48} className="text-blue-200" />
                      </div>
                    )}
                    {/* Lock/unlock badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      unlocked ? "bg-green-500 text-white" : "bg-gray-900/70 text-white"
                    }`}>
                      {unlocked ? <Unlock size={11} /> : <Lock size={11} />}
                      {unlocked ? "Unlocked" : "Locked"}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{course.name}</h3>
                    {course.description && course.description !== "Description" && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{course.description}</p>
                    )}
                    <div className="flex gap-2 mt-auto pt-3">
                      <Link
                        href={`/courses/${course.rowId}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-semibold text-white tnc-brand-gradient hover:opacity-90 transition-opacity"
                        data-testid={`btn-view-${course.rowId}`}
                      >
                        View Content <ArrowRight size={12} />
                      </Link>
                      {!unlocked && (
                        <Link
                          href="/buy"
                          className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors"
                          data-testid={`btn-buy-${course.rowId}`}
                        >
                          Buy
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
