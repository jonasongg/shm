import Body from "./body";

export default async function Page() {
  // initial fetch
  const response = await fetch("http://localhost:5043/api/report");
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data: RawDataReport[] = await response.json();

  return (
    <>
      <header className="font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      {<Body data={data} />}
    </>
  );
}
