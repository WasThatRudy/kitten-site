import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { HowItWorks } from "@/components/HowItWorks";
import { AppTour } from "@/components/AppTour";
import { Guarantee } from "@/components/Guarantee";
import { Migration } from "@/components/Migration";
import { SafetySpec } from "@/components/SafetySpec";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <AppTour />
      <Guarantee />
      <Migration />
      <SafetySpec />
      <Footer />
    </main>
  );
}
