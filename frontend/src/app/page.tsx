import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <header className="font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      <main className="p-8 gap-8 grid grid-cols-2 grid-rows-2 flex-1">
        <Card>
          <CardHeader className="text-xl">
            <CardTitle>VM 1</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </main>
    </>
  );
}
