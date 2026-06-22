import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">
        Workforce AI
      </h1>

      <p>
        Clerk authentication is working.
      </p>

      <UserButton />
    </main>
  );
}