"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  Globe,
  LockKeyhole,
  Rocket,
  Users,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const MotionLink = motion(Link);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const MotionButton = motion(Button);

export default function LandingPage() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  const scrollToSection = (
    e: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        void controls.start("visible");
      } else {
        setIsVisible(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        void controls.start("hidden");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1635] text-[#e0d9ff]">
      <motion.header
        className="fixed z-50 flex h-14 w-full items-center bg-[#13102b] px-4 lg:px-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <MotionLink
          className="flex items-center justify-center"
          href="#"
          whileHover={{ scale: 1.05 }}
        >
          <Rocket className="mr-2 h-6 w-6 text-[#14f195]" />
          <span className="font-bold text-[#e0d9ff]">dAIos</span>
        </MotionLink>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <MotionLink
            className="text-sm font-medium transition-colors hover:text-[#14f195]"
            href="#features"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              scrollToSection(e, "features")
            }
            whileHover={{ scale: 1.1 }}
          >
            Features
          </MotionLink>
          <MotionLink
            className="text-sm font-medium transition-colors hover:text-[#14f195]"
            href="#how-it-works"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              scrollToSection(e, "how-it-works")
            }
            whileHover={{ scale: 1.1 }}
          >
            How It Works
          </MotionLink>
          <MotionLink
            className="text-sm font-medium transition-colors hover:text-[#14f195]"
            href="#benefits"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
              scrollToSection(e, "benefits")
            }
            whileHover={{ scale: 1.1 }}
          >
            Benefits
          </MotionLink>
        </nav>
      </motion.header>
      <main className="flex-1 pt-14">
        <section className="w-full py-12 md:py-20 lg:py-24 xl:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center space-y-4 text-center"
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
            >
              <motion.div className="space-y-2" variants={fadeInUp}>
                <h1 className="text-3xl font-bold tracking-tighter text-[#e0d9ff] sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Build Fair DAOs with AI-Powered Member Selection
                </h1>
                <p className="mx-auto max-w-[700px] text-[#b3a8e0] md:text-xl">
                  Eliminate bias in DAO membership with our intelligent
                  admittance system. Set objective criteria and let AI ensure
                  fair, transparent, and merit-based community growth.
                </p>
              </motion.div>
              <Link href="/launch">
                <motion.div className="space-x-4" variants={fadeInUp}>
                  <MotionButton
                    className="bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </MotionButton>
                  <MotionButton
                    variant="outline"
                    className="border-[#14f195] bg-transparent text-[#14f195] hover:bg-[#14f195]/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                  </MotionButton>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
        <motion.section
          className="w-full bg-[#211d47] py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.h2
              className="mb-8 text-center text-3xl font-bold tracking-tighter text-[#e0d9ff] sm:text-4xl md:text-5xl"
              variants={fadeInUp}
            >
              Trending dAIos
            </motion.h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="mx-auto w-full max-w-5xl"
            >
              <CarouselContent className="-ml-4">
                {[
                  {
                    name: "DeFi Governance DAO",
                    members: "5.2K",
                    tvl: "$2.4M",
                    description: "Decentralized financial protocols governance",
                    color: "#14f195",
                  },
                  {
                    name: "NFT Creators Guild",
                    members: "3.8K",
                    tvl: "$1.8M",
                    description: "Digital artists and NFT creators collective",
                    color: "#14f195",
                  },
                  {
                    name: "Climate Action DAO",
                    members: "7.1K",
                    tvl: "$3.2M",
                    description: "Funding climate change initiatives",
                    color: "#14f195",
                  },
                  {
                    name: "Web3 Education Hub",
                    members: "4.5K",
                    tvl: "$1.5M",
                    description: "Decentralized learning and certification",
                    color: "#14f195",
                  },
                ].map((dao, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      className="flex h-full flex-col rounded-xl border border-[#3d3470] bg-[#211d47] p-6"
                      variants={fadeInUp}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#e0d9ff]">
                          {dao.name}
                        </h3>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: dao.color }}
                        />
                      </div>
                      <p className="mb-4 flex-1 text-[#b3a8e0]">
                        {dao.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#14f195]">
                          {dao.members} members
                        </span>
                        <span className="text-[#14f195]">TVL: {dao.tvl}</span>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex justify-center gap-4">
                <CarouselPrevious className="static bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]" />
                <CarouselNext className="static bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]" />
              </div>
            </Carousel>
          </div>
        </motion.section>
        <motion.section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.h2
              className="mb-8 text-center text-3xl font-bold tracking-tighter text-[#e0d9ff] sm:text-4xl md:text-5xl"
              variants={fadeInUp}
            >
              Platform Features
            </motion.h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  icon: Globe,
                  title: "Decentralized Governance",
                  description:
                    "Create truly democratic communities with AI-verified membership and transparent decision-making.",
                  color: "#14f195",
                },
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  icon: Cpu,
                  title: "Autonomous Admittance",
                  description:
                    "Let AI evaluate membership applications against your criteria, ensuring unbiased and consistent selection.",
                  color: "#14f195",
                },
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  icon: LockKeyhole,
                  title: "Secure Funding",
                  description:
                    "Protect your DAO with verified members who align with your community's goals and values.",
                  color: "#14f195",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center"
                  variants={fadeInUp}
                >
                  <motion.div animate={pulseAnimation}>
                    <feature.icon
                      className="mb-4 h-12 w-12"
                      style={{ color: feature.color }}
                    />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-bold text-[#e0d9ff]">
                    {feature.title}
                  </h3>
                  <p className="text-[#b3a8e0]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        <motion.section
          id="how-it-works"
          className="w-full bg-[#211d47] py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.h2
              className="mb-8 text-center text-3xl font-bold tracking-tighter text-[#e0d9ff] sm:text-4xl md:text-5xl"
              variants={fadeInUp}
            >
              How It Works
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  icon: Users,
                  title: "1. Create Your DAO",
                  description:
                    "Define your community's purpose and set clear, objective membership criteria.",
                  color: "#14f195",
                },
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  icon: Cpu,
                  title: "2. Set Admittance Criteria",
                  description:
                    "Specify the qualifications, skills, and values that matter to your DAO - our AI handles the rest.",
                  color: "#14f195",
                },
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  icon: Rocket,
                  title: "3. Launch and Grow",
                  description:
                    "Build a thriving community of qualified members, selected fairly and transparently by AI.",
                  color: "#14f195",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center"
                  variants={fadeInUp}
                >
                  <motion.div
                    className="mb-4 rounded-full p-3"
                    style={{ backgroundColor: step.color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <step.icon className="h-6 w-6 text-[#13102b]" />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-bold text-[#e0d9ff]">
                    {step.title}
                  </h3>
                  <p className="text-[#b3a8e0]">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        <motion.section
          id="benefits"
          className="w-full py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.h2
              className="mb-8 text-center text-3xl font-bold tracking-tighter text-[#e0d9ff] sm:text-4xl md:text-5xl"
              variants={fadeInUp}
            >
              Benefits of dAIos
            </motion.h2>
            <div className="grid place-items-center gap-6 md:grid-cols-2">
              {[
                {
                  title: "Unbiased Selection",
                  description:
                    "AI evaluates every application objectively, eliminating human bias and politics from member selection.",
                },
                {
                  title: "Merit-Based Growth",
                  description:
                    "Build stronger communities by admitting members based purely on their qualifications and alignment.",
                },
                {
                  title: "Consistent Standards",
                  description:
                    "Ensure every member meets the same high standards through automated, criteria-based evaluation.",
                },
                {
                  title: "Scalable Governance",
                  description:
                    "Grow your DAO confidently knowing that new members are vetted thoroughly and fairly by AI.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex max-w-md items-center justify-center space-x-4"
                  variants={fadeInUp}
                >
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-[#14f195]" />
                  <div className="flex flex-col items-center text-center">
                    <h3 className="mb-2 text-xl font-bold text-[#e0d9ff]">
                      {benefit.title}
                    </h3>
                    <p className="text-[#b3a8e0]">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        <motion.section
          className="w-full bg-[#211d47] py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center space-y-4 text-center"
              variants={fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-[#e0d9ff] sm:text-4xl md:text-5xl">
                  Ready to Build a Truly Fair DAO?
                </h2>
                <p className="mx-auto max-w-[600px] text-[#b3a8e0] md:text-xl">
                  Join the future of decentralized organizations where AI
                  ensures unbiased, merit-based membership for stronger
                  communities.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1 border-[#3d3470] bg-[#211d47] text-[#e0d9ff]"
                    placeholder="Enter your email"
                    type="email"
                  />

                  <MotionButton
                    className="bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </MotionButton>
                </form>
                <p className="text-xs text-[#b3a8e0]">
                  By signing up, you agree to our{" "}
                  <Link
                    className="underline underline-offset-2 hover:text-[#14f195]"
                    href="#"
                  >
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <motion.footer
        className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-[#3d3470] bg-[#13102b] px-4 py-6 sm:flex-row md:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-[#b3a8e0]">
          © 2024 dAIos. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            className="text-xs transition-colors hover:text-[#14f195]"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs transition-colors hover:text-[#14f195]"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </motion.footer>
      <motion.div
        className="fixed bottom-4 right-4 cursor-pointer rounded-full bg-[#14f195] p-2 text-[#13102b]"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 },
        }}
        transition={{ duration: 0.2 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowRight className="h-6 w-6 rotate-[-90deg] transform" />
      </motion.div>
    </div>
  );
}
