import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminAuthResponse, AdminLoginInput, AdminStats, AdminUsersResponse, AuthResponse, Course, ErrorResponse, GetAdminUsersParams, HealthStatus, ListQuizzesParams, ListSessionsParams, LoginInput, PromoStatus, PromoToggleInput, Purchase, PurchaseInput, Quiz, QuizListResponse, RegisterInput, Session, Slider } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetCoursesUrl: () => string;
/**
 * @summary Get all courses/batches
 */
export declare const getCourses: (options?: RequestInit) => Promise<Course[]>;
export declare const getGetCoursesQueryKey: () => readonly ["/api/courses"];
export declare const getGetCoursesQueryOptions: <TData = Awaited<ReturnType<typeof getCourses>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCourses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCourses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCoursesQueryResult = NonNullable<Awaited<ReturnType<typeof getCourses>>>;
export type GetCoursesQueryError = ErrorType<unknown>;
/**
 * @summary Get all courses/batches
 */
export declare function useGetCourses<TData = Awaited<ReturnType<typeof getCourses>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCourses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListSessionsUrl: (params?: ListSessionsParams) => string;
/**
 * @summary Get sessions (videos/content) for a course
 */
export declare const listSessions: (params?: ListSessionsParams, options?: RequestInit) => Promise<Session[]>;
export declare const getListSessionsQueryKey: (params?: ListSessionsParams) => readonly ["/api/sessions", ...ListSessionsParams[]];
export declare const getListSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<unknown>>(params?: ListSessionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listSessions>>>;
export type ListSessionsQueryError = ErrorType<unknown>;
/**
 * @summary Get sessions (videos/content) for a course
 */
export declare function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<unknown>>(params?: ListSessionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSessionUrl: (rowId: string) => string;
/**
 * @summary Get a single session by rowId
 */
export declare const getSession: (rowId: string, options?: RequestInit) => Promise<Session>;
export declare const getGetSessionQueryKey: (rowId: string) => readonly [`/api/sessions/${string}`];
export declare const getGetSessionQueryOptions: <TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<ErrorResponse>>(rowId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type GetSessionQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a single session by rowId
 */
export declare function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<ErrorResponse>>(rowId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSlidersUrl: () => string;
/**
 * @summary Get homepage slider images
 */
export declare const getSliders: (options?: RequestInit) => Promise<Slider[]>;
export declare const getGetSlidersQueryKey: () => readonly ["/api/sliders"];
export declare const getGetSlidersQueryOptions: <TData = Awaited<ReturnType<typeof getSliders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSliders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSliders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSlidersQueryResult = NonNullable<Awaited<ReturnType<typeof getSliders>>>;
export type GetSlidersQueryError = ErrorType<unknown>;
/**
 * @summary Get homepage slider images
 */
export declare function useGetSliders<TData = Awaited<ReturnType<typeof getSliders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSliders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary User login
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary User login
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getRegisterUrl: () => string;
/**
 * @summary Register new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register new user
*/
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getGetUserPurchasesUrl: (userId: string) => string;
/**
 * @summary Get purchased courses for a user
 */
export declare const getUserPurchases: (userId: string, options?: RequestInit) => Promise<Purchase[]>;
export declare const getGetUserPurchasesQueryKey: (userId: string) => readonly [`/api/purchases/${string}`];
export declare const getGetUserPurchasesQueryOptions: <TData = Awaited<ReturnType<typeof getUserPurchases>>, TError = ErrorType<unknown>>(userId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserPurchases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserPurchases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserPurchasesQueryResult = NonNullable<Awaited<ReturnType<typeof getUserPurchases>>>;
export type GetUserPurchasesQueryError = ErrorType<unknown>;
/**
 * @summary Get purchased courses for a user
 */
export declare function useGetUserPurchases<TData = Awaited<ReturnType<typeof getUserPurchases>>, TError = ErrorType<unknown>>(userId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserPurchases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePurchaseUrl: () => string;
/**
 * @summary Record a course purchase
 */
export declare const createPurchase: (purchaseInput: PurchaseInput, options?: RequestInit) => Promise<Purchase>;
export declare const getCreatePurchaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPurchase>>, TError, {
        data: BodyType<PurchaseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPurchase>>, TError, {
    data: BodyType<PurchaseInput>;
}, TContext>;
export type CreatePurchaseMutationResult = NonNullable<Awaited<ReturnType<typeof createPurchase>>>;
export type CreatePurchaseMutationBody = BodyType<PurchaseInput>;
export type CreatePurchaseMutationError = ErrorType<unknown>;
/**
* @summary Record a course purchase
*/
export declare const useCreatePurchase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPurchase>>, TError, {
        data: BodyType<PurchaseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPurchase>>, TError, {
    data: BodyType<PurchaseInput>;
}, TContext>;
export declare const getAdminLoginUrl: () => string;
/**
 * @summary Admin login
 */
export declare const adminLogin: (adminLoginInput: AdminLoginInput, options?: RequestInit) => Promise<AdminAuthResponse>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginInput>;
export type AdminLoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Admin login
*/
export declare const useAdminLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Get admin dashboard stats
 */
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminUsersUrl: (params?: GetAdminUsersParams) => string;
/**
 * @summary Get all users (admin)
 */
export declare const getAdminUsers: (params?: GetAdminUsersParams, options?: RequestInit) => Promise<AdminUsersResponse>;
export declare const getGetAdminUsersQueryKey: (params?: GetAdminUsersParams) => readonly ["/api/admin/users", ...GetAdminUsersParams[]];
export declare const getGetAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof getAdminUsers>>, TError = ErrorType<unknown>>(params?: GetAdminUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminUsers>>>;
export type GetAdminUsersQueryError = ErrorType<unknown>;
/**
 * @summary Get all users (admin)
 */
export declare function useGetAdminUsers<TData = Awaited<ReturnType<typeof getAdminUsers>>, TError = ErrorType<unknown>>(params?: GetAdminUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPromoStatusUrl: () => string;
/**
 * @summary Get current promo mode status
 */
export declare const getPromoStatus: (options?: RequestInit) => Promise<PromoStatus>;
export declare const getGetPromoStatusQueryKey: () => readonly ["/api/promo/status"];
export declare const getGetPromoStatusQueryOptions: <TData = Awaited<ReturnType<typeof getPromoStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPromoStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPromoStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPromoStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getPromoStatus>>>;
export type GetPromoStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get current promo mode status
 */
export declare function useGetPromoStatus<TData = Awaited<ReturnType<typeof getPromoStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPromoStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getTogglePromoUrl: () => string;
/**
 * @summary Toggle promotional mode (admin only)
 */
export declare const togglePromo: (promoToggleInput: PromoToggleInput, options?: RequestInit) => Promise<PromoStatus>;
export declare const getTogglePromoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof togglePromo>>, TError, {
        data: BodyType<PromoToggleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof togglePromo>>, TError, {
    data: BodyType<PromoToggleInput>;
}, TContext>;
export type TogglePromoMutationResult = NonNullable<Awaited<ReturnType<typeof togglePromo>>>;
export type TogglePromoMutationBody = BodyType<PromoToggleInput>;
export type TogglePromoMutationError = ErrorType<unknown>;
/**
* @summary Toggle promotional mode (admin only)
*/
export declare const useTogglePromo: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof togglePromo>>, TError, {
        data: BodyType<PromoToggleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof togglePromo>>, TError, {
    data: BodyType<PromoToggleInput>;
}, TContext>;
export declare const getListQuizzesUrl: (params?: ListQuizzesParams) => string;
/**
 * @summary List available quiz/exam sets
 */
export declare const listQuizzes: (params?: ListQuizzesParams, options?: RequestInit) => Promise<QuizListResponse>;
export declare const getListQuizzesQueryKey: (params?: ListQuizzesParams) => readonly ["/api/quizzes", ...ListQuizzesParams[]];
export declare const getListQuizzesQueryOptions: <TData = Awaited<ReturnType<typeof listQuizzes>>, TError = ErrorType<unknown>>(params?: ListQuizzesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuizzesQueryResult = NonNullable<Awaited<ReturnType<typeof listQuizzes>>>;
export type ListQuizzesQueryError = ErrorType<unknown>;
/**
 * @summary List available quiz/exam sets
 */
export declare function useListQuizzes<TData = Awaited<ReturnType<typeof listQuizzes>>, TError = ErrorType<unknown>>(params?: ListQuizzesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetQuizUrl: (examId: string) => string;
/**
 * @summary Get a quiz/exam with all questions
 */
export declare const getQuiz: (examId: string, options?: RequestInit) => Promise<Quiz>;
export declare const getGetQuizQueryKey: (examId: string) => readonly [`/api/quiz/${string}`];
export declare const getGetQuizQueryOptions: <TData = Awaited<ReturnType<typeof getQuiz>>, TError = ErrorType<ErrorResponse>>(examId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuizQueryResult = NonNullable<Awaited<ReturnType<typeof getQuiz>>>;
export type GetQuizQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a quiz/exam with all questions
 */
export declare function useGetQuiz<TData = Awaited<ReturnType<typeof getQuiz>>, TError = ErrorType<ErrorResponse>>(examId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map