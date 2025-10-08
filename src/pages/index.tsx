"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Shield,
  Lock,
  Globe,
  Zap,
  Users,
  Clock,
  Star,
  MessageCircle,
} from "lucide-react";
import router from "next/router";

export default function DeAppsVoteLanding() {
  const [email, setEmail] = useState("");

  const features = [
    {
      title: "Secure Blockchain Voting",
      description: "Immutable votes recorded on decentralized ledger technology",
      icon: Shield,
    },
    {
      title: "Transparent Process",
      description: "Every vote is verifiable and publicly auditable",
      icon: Globe,
    },
    {
      title: "Instant Results",
      description: "Real-time tallying and immediate outcome visibility",
      icon: Zap,
    },
    {
      title: "Community Governance",
      description: "Empower communities with direct decision-making power",
      icon: Users,
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Connect Wallet",
      description: "Securely connect your cryptocurrency wallet",
    },
    {
      step: "2",
      title: "Select Proposal",
      description: "Choose from active community proposals",
    },
    {
      step: "3",
      title: "Cast Your Vote",
      description: "Submit your vote anonymously and securely",
    },
    {
      step: "4",
      title: "View Results",
      description: "Watch real-time results with full transparency",
    },
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "DAO Member",
      content:
        "DeApps Vote transformed our community governance. The transparency and ease of use made participation increase by 300%.",
    },
    {
      name: "Maria Rodriguez",
      role: "Project Lead",
      content:
        "Finally, a voting platform that's both secure and user-friendly. The blockchain verification gives everyone confidence in the results.",
    },
    {
      name: "James Wilson",
      role: "Community Manager",
      content:
        "The real-time results and mobile accessibility made it possible for our global community to participate meaningfully.",
    },
  ];

  return (
    <div >
      {/* Header */}


      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen py-20 lg:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Decentralized Petitions for the{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Future of Governance
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-gray-300">
              Secure, transparent, and verifiable blockchain-based petitioning
              platform for DAOs, communities, and organizations.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => {
                  router.push('/petitions');
                }}
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-purple-600 px-8 py-3 text-white hover:from-cyan-700 hover:to-purple-700"
              >
                Start Petitioning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-700 bg-transparent px-8 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>

            <div className="mt-12 rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-cyan-400" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-purple-400" />
                  <span>Fully Transparent</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-green-400" />
                  <span>Real-time Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Next-Generation Petitioning Features
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Powered by blockchain technology for unprecedented security and
              transparency
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-900/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              How DeApps Petitions Works
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Simple, secure, and transparent petitioning in four easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
                  <span className="text-2xl font-bold text-cyan-400">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="absolute left-14 top-8 hidden h-0.5 w-60 translate-x-1/2 bg-gray-700 lg:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Trusted by Decentralized Communities
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              See what our users are saying about the future of petitioning
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-gray-800 bg-gray-900/50 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <blockquote className="mb-4 leading-relaxed text-gray-300">
                    {testimonial.content}
                  </blockquote>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Ready to Transform Your Voting Process?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
              Join the future of decentralized governance today
            </p>

            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email for updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-gray-700 bg-gray-900 text-white placeholder:text-gray-500"
              />
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 hover:to-purple-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              No spam, just updates about new features and releases
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Everything you need to know about DeApps Petitions
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  How does blockchain petitioning work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Each petition is recorded as a transaction on a decentralized
                  blockchain, making it immutable, transparent, and verifiable
                  by anyone. Your identity remains private while your petition is
                  securely recorded.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  What wallets are supported?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  We support all major Web3 wallets including MetaMask, WalletConnect,
                  Coinbase Wallet, and Phantom. More wallet integrations are
                  coming soon.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Is my vote really anonymous?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Yes, we use zero-knowledge proofs and advanced cryptographic
                  techniques to ensure your vote is completely anonymous while
                  still being verifiable on the blockchain.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
