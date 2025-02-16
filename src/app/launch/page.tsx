"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  Github,
  Twitter,
  Wallet,
  Heart,
  Loader2,
} from "lucide-react";

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    title: "Token Details",
    description: "Set your DAO's name, symbol, and description",
  },
  {
    title: "Eligibility Criteria",
    description: "Define who can join your DAO",
  },
  {
    title: "Review & Launch",
    description: "Review your DAO configuration",
  },
];

type DaoConfig = {
  name: string;
  description: string;
  image: string | null;
  tokenSymbol: string;
  systemPrompt: string;
  generatedCriteria: Array<{
    title: string;
    description: string;
    icon: "github" | "twitter" | "wallet" | "generic";
  }> | null;
};

type GenerateCriteriaResponse = {
  criteria: Array<{
    title: string;
    description: string;
    icon: "github" | "twitter" | "wallet" | "generic";
  }>;
};

export default function LaunchPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [daoConfig, setDaoConfig] = useState<DaoConfig>({
    name: "",
    description: "",
    image: null,
    tokenSymbol: "",
    systemPrompt: "",
    generatedCriteria: null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          setDaoConfig((prev) => ({
            ...prev,
            image: result as string,
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generateCriteria = async () => {
    try {
      setIsGenerating(true);

      const response = await fetch("/api/generate-criteria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: daoConfig.systemPrompt,
          daoName: daoConfig.name,
          tokenSymbol: daoConfig.tokenSymbol,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate criteria");
      }

      const data = (await response.json()) as GenerateCriteriaResponse;
      setDaoConfig((prev) => ({
        ...prev,
        generatedCriteria: data.criteria,
      }));
    } catch (error) {
      console.error("Error generating criteria:", error);
      // You might want to show an error toast here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && !daoConfig.generatedCriteria) {
      void generateCriteria();
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLaunch = () => {
    // TODO: Save DAO configuration and create new DAO
    router.push("/defi-governance");
  };

  return (
    <main className="min-h-screen bg-[#1a1635] p-8 text-[#e0d9ff]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Launch Your dAIo</h1>
          <p className="text-[#b3a8e0]">Create an AI-powered DAO in minutes</p>
        </div>

        <div className="mb-8 flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-1 flex-col items-center border-b-2 ${
                index <= currentStep
                  ? "border-[#14f195] text-[#14f195]"
                  : "border-[#3d3470] text-[#b3a8e0]"
              } pb-4`}
            >
              <span className="mb-1 text-sm font-medium">{step.title}</span>
              <span className="text-xs">{step.description}</span>
            </div>
          ))}
        </div>

        <Card className="border-[#3d3470] bg-[#211d47]">
          <CardHeader>
            <CardTitle className="text-[#e0d9ff]">
              {steps[currentStep]?.title ?? "Loading..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-[#b3a8e0]">DAO Name</label>
                  <Input
                    value={daoConfig.name}
                    onChange={(e) =>
                      setDaoConfig((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., DeFi Governance DAO"
                    className="border-[#3d3470] bg-[#13102b] text-[#e0d9ff]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#b3a8e0]">Token Symbol</label>
                  <Input
                    value={daoConfig.tokenSymbol}
                    onChange={(e) =>
                      setDaoConfig((prev) => ({
                        ...prev,
                        tokenSymbol: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., DGOV"
                    className="border-[#3d3470] bg-[#13102b] text-[#e0d9ff]"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#b3a8e0]">Description</label>
                  <Textarea
                    value={daoConfig.description}
                    onChange={(e) =>
                      setDaoConfig((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What is your DAO's mission?"
                    className="min-h-[100px] border-[#3d3470] bg-[#13102b] text-[#e0d9ff]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#b3a8e0]">DAO Image</label>
                  <div className="flex items-center gap-4">
                    {daoConfig.image ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full">
                        <Image
                          src={daoConfig.image}
                          alt="DAO Image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#3d3470] bg-[#13102b]">
                        <Upload className="h-8 w-8 text-[#b3a8e0]" />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="border-[#3d3470] bg-transparent text-[#14f195]"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      Upload Image
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-[#b3a8e0]">
                    Eligibility Criteria
                  </label>
                  <Textarea
                    value={daoConfig.systemPrompt}
                    onChange={(e) =>
                      setDaoConfig((prev) => ({
                        ...prev,
                        systemPrompt: e.target.value,
                      }))
                    }
                    placeholder="Describe who should be eligible to join your DAO. Be specific about technical skills, community involvement, and values you're looking for."
                    className="min-h-[200px] border-[#3d3470] bg-[#13102b] text-[#e0d9ff]"
                  />
                </div>
                <Button
                  className="w-full bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b] disabled:opacity-50"
                  onClick={generateCriteria}
                  disabled={isGenerating || !daoConfig.systemPrompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Criteria"
                  )}
                </Button>
                {daoConfig.generatedCriteria && (
                  <div className="space-y-4 rounded-lg border border-[#3d3470] bg-[#13102b]/50 p-4">
                    {daoConfig.generatedCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {criteria.icon === "github" && (
                          <Github className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                        )}
                        {criteria.icon === "twitter" && (
                          <Twitter className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                        )}
                        {criteria.icon === "wallet" && (
                          <Wallet className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                        )}
                        {criteria.icon === "generic" && (
                          <Heart className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                        )}
                        <div>
                          <h3 className="font-medium text-[#e0d9ff]">
                            {criteria.title}
                          </h3>
                          <p className="text-sm text-[#b3a8e0]">
                            {criteria.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-[#3d3470] bg-[#13102b]/50 p-6">
                  <div className="mb-6 flex items-center gap-4">
                    {daoConfig.image && (
                      <Image
                        src={daoConfig.image}
                        alt="DAO Image"
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-[#e0d9ff]">
                        {daoConfig.name}
                      </h2>
                      <p className="text-sm text-[#b3a8e0]">
                        {daoConfig.description}
                      </p>
                    </div>
                  </div>
                  <div className="mb-6 rounded-lg border border-[#3d3470] bg-[#13102b] p-4">
                    <span className="text-sm text-[#b3a8e0]">Token Symbol</span>
                    <p className="font-medium text-[#e0d9ff]">
                      {daoConfig.tokenSymbol}
                    </p>
                  </div>
                  {daoConfig.generatedCriteria && (
                    <div>
                      <h3 className="mb-4 font-medium text-[#e0d9ff]">
                        Eligibility Criteria
                      </h3>
                      <div className="space-y-4">
                        {daoConfig.generatedCriteria.map((criteria, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-lg border border-[#3d3470] bg-[#13102b]/50 p-4"
                          >
                            {criteria.icon === "github" && (
                              <Github className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                            )}
                            {criteria.icon === "twitter" && (
                              <Twitter className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                            )}
                            {criteria.icon === "wallet" && (
                              <Wallet className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                            )}
                            {criteria.icon === "generic" && (
                              <Heart className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                            )}
                            <div>
                              <h3 className="font-medium text-[#e0d9ff]">
                                {criteria.title}
                              </h3>
                              <p className="text-sm text-[#b3a8e0]">
                                {criteria.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            className="border-[#3d3470] text-[#b3a8e0]"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              className="bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]"
              onClick={handleLaunch}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Launch DAO
            </Button>
          ) : (
            <Button
              className="bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
