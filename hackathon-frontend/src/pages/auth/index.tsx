import { LayoutPage } from "@/layouts/root-layout";
import requestInterceptorRunner from "@/request-interceptors/request-interceptor-runner";
import { GetServerSideProps } from "next";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetaMask from "~/public/metamask.svg";
import { useEffect, useState } from "react";
import { useSDK } from "@metamask/sdk-react";
import { useLoginStore } from "@/store/login";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { trpc } from "@/lib/trpc";

export const getServerSideProps: GetServerSideProps<AuthProps> = async (
  context,
) =>
  await requestInterceptorRunner<AuthProps>(context, [], async () => {
    // Do data fetching for home page with GraphQL

    // Return this data as server-side props
    return { props: {} };
  });

export interface AuthProps {}

const Auth: LayoutPage = () => {
  const { loginState, logIn } = useLoginStore();
  const router = useRouter();
  const logInServer = trpc.logIn.useMutation();

  const { toast } = useToast();
  const { sdk } = useSDK();

  // if already connected, navigate to main page
  useEffect(() => {
    if (loginState.loggedIn) router.push("/");
  });

  // connection logic
  const connect = async () => {
    try {
      // connect and error handling
      const accounts = (await sdk?.connect()) as string[] | undefined;
      if (typeof accounts?.[0] !== "string" || accounts[0].length === 0)
        throw new Error("Failed to connect to MetaMask");

      // update state and navigate to main page
      const account = accounts[0];
      logInServer.mutate({ account });
      logIn(account);
      router.push("/");
    } catch (err) {
      console.warn(err);
      toast({
        title: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="relative hidden flex-1 xl:block overflow-hidden bg-slate-200/50">
        <div className="absolute text-3xl font-bold rounded-sm mx-5 my-3 p-2">
          Glimpse
        </div>
        {/* <Image
          src={BgImg}
          alt="bg"
          className="object-cover min-w-full min-h-full"
        /> */}
      </div>
      <div className="bg-background w-[916px] flex justify-center overflow-auto scrollbar-none">
        <div className="flex flex-col items-center box-content w-full h-fit my-auto lg:w-[624px]">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome to Glimpse!</CardTitle>
            <CardDescription>
              Glimpse helps you collect and analyse data whilst preserving user
              privacy. It is designed to combat various forms of fraud, such as
              the manipulation of the dataset and bribery of the participants,
              thereby inspiring confidence in private information markets.
            </CardDescription>
          </CardHeader>
          <CardFooter className="w-full lg:w-fit">
            <Button
              onClick={connect}
              variant="outline"
              className="w-full lg:w-fit h-fit text-base py-2.5 px-6"
            >
              <MetaMask className="mr-4 h-6 w-6" /> Log In with MetaMask
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  );
};

// Auth.getLayout = (page) => {
//   return <AppLayout>{page}</AppLayout>;
// };

export default Auth;
