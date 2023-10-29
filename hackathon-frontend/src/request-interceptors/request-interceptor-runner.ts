import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData,
  Redirect,
} from "next";
import { ParsedUrlQuery } from "querystring";

type RequestInterceptorResults = { redirect: Redirect } | { notFound: true };

export type RequestInterceptor<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = (
  context: GetServerSidePropsContext<Q, D>,
) => Promise<RequestInterceptorResults | void>;

export type RequestInterceptorChain<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = RequestInterceptor<Q, D>[];

export default async function requestInterceptorRunner<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
>(
  /** The request context, containing all the request info */
  context: GetServerSidePropsContext<Q, D>,
  /** The interceptor functions to be run */
  interceptors: RequestInterceptorChain<Q, D>,
  /** The callback function to be run for any further data fetching */
  callback: (
    context: GetServerSidePropsContext<Q, D>,
  ) => Promise<GetServerSidePropsResult<P>>,
): Promise<GetServerSidePropsResult<P>> {
  // Run interceptors
  for (let i = 0; i < interceptors.length; i++) {
    const out = await interceptors[i](context);
    if (out) return out;
  }

  // Run callback
  return await callback(context);
}
