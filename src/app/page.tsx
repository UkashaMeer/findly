'use client';

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from 'convex/react';
import { useEffect } from "react";
import Loader from "@/components/global/Loader";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const saveUser = useMutation(api.user.saveUser);
  const currentUser = useQuery(api.user.getCurrentUser);

  useEffect(() => {
    if (isLoaded && user && isSignedIn) {
      saveUser({
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        image: user.imageUrl || "",
      });
    }
  }, [isLoaded, user, isSignedIn, saveUser]);

  useEffect(() => {
    if (isLoaded && isSignedIn && currentUser !== undefined) {
      if (currentUser?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    }
  }, [isLoaded, isSignedIn, currentUser, router]);

  if (!isLoaded) {
    return <Loader text="Loading..." />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Welcome to Findly</h1>
          <p className="mb-4">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return <Loader text="Setting up your profile..." />;
}