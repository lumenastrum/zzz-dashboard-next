import { RandomPlayHost } from "@/random-play-host/RandomPlayHost";

// The store (A.): the Rental Wall. Every section is a view inside the one mounted stage; the other
// routes are static entry points that open the stage on a section or a tape (random-play/docs/07).
export default function Home() {
  return <RandomPlayHost />;
}
