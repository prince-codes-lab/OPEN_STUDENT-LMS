import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Sparkles, Target, Users, Lightbulb, TrendingUp, Heart } from "lucide-react"
import { HeroSlider } from "@/components/hero-slider"

export default function HomePage() {
  const sliderImages = [
    {
      src: "/learning-community.jpg",
      title: "The OPEN Students",
      description: "Beyond the Classroom - Empowering African and Asian Youth",
    },
    {
      src: "/educational-tour.jpg",
      title: "Learning Beyond Borders",
      description: "Join Our Transformative Educational Tours Across Nigeria",
    },
    {
      src: "/digital-skills-training.png",
      title: "Master In-Demand Skills",
      description: "Practical Courses in Writing, Design, Video, and Leadership",
    },
  ]

  return (
    <div className="min-h-screen font-sans">
      <Navigation />

      <HeroSlider slides={sliderImages} />

      {/* CTA Below Slider */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4E0942] text-balance">
                Ready to Go <span className="text-[#FEEB00]">Beyond the Classroom?</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Join thousands of students transforming their futures with practical skills, mentorship, and real-world
                experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-all"
              >
                <Link href="/auth/sign-up">Join the Journey</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-[#4E0942] border-2 border-[#4E0942] font-bold text-lg px-8 py-6 transition-all hover:scale-105"
              >
                <Link href="/programs">Explore Programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Main About */}
            <div className="text-center space-y-6 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4E0942]">About The OPEN Students</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
              <p className="text-lg text-gray-700 leading-relaxed">
                The OPEN Students is an education technology (edtech) and youth development platform focused on bridging
                the gap between academic learning and real-world application. We provide digital courses, practical
                learning resources, mentorship, and internship opportunities for teenagers, students, and young adults
                across Africa and Asia.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our goal is to raise a generation of emotionally, socially, spiritually, and intellectually intelligent
                individuals equipped to thrive in life, work, and leadership.
              </p>
            </div>

            {/* Founder Section */}
            <Card className="border-2 border-[#DD91D0] shadow-xl animate-slide-in-left">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-[#4E0942] to-[#DD91D0] p-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 bg-[#FEEB00] rounded-full mx-auto flex items-center justify-center">
                        <span className="text-[#4E0942] font-bold text-4xl">DW</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Daniella Williams</h3>
                        <p className="text-[#FEEB00]">Founder & Visionary</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-white">
                    <h3 className="text-2xl font-bold text-[#4E0942] mb-4">Meet Our Founder</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Daniella Williams is a dynamic, multi-talented thinker and strategist who blends creativity,
                      emotional intelligence, and practical execution to empower students and young adults. With a rich
                      background in public speaking, content creation, and digital media, she envisions The OPEN
                      Students as a platform that equips young people with the skills, mentorship, and real-world
                      experiences they need to succeed beyond the classroom.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4E0942]">Our Core Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
              <p className="text-lg text-gray-700">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "Practicality",
                  description: "We prioritize applicable knowledge that makes a real difference",
                  color: "#FF2768",
                },
                {
                  icon: Heart,
                  title: "Transparency",
                  description: "We keep it real and honest in everything we do",
                  color: "#FEEB00",
                },
                {
                  icon: Users,
                  title: "Collaboration",
                  description: "We build with people and for people",
                  color: "#4E0942",
                },
                {
                  icon: Sparkles,
                  title: "Empowerment",
                  description: "We empower learners to take charge of their growth",
                  color: "#DD91D0",
                },
                {
                  icon: Lightbulb,
                  title: "Innovation",
                  description: "We seek fresh ways to bridge learning and life",
                  color: "#FF2768",
                },
                {
                  icon: TrendingUp,
                  title: "Excellence",
                  description: "We strive for excellence in every learning experience",
                  color: "#FEEB00",
                },
              ].map((value, index) => (
                <Card
                  key={value.title}
                  className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${value.color}20` }}
                    >
                      <value.icon size={28} style={{ color: value.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#4E0942]">{value.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#4E0942] to-[#DD91D0]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-balance">
              Join thousands of students <span className="text-[#FEEB00]">transforming their futures</span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Start your practical learning journey today with courses, mentorship, and real-world experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-all"
              >
                <Link href="/auth/sign-up">Get Started Today</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white font-bold text-lg px-8 py-6 backdrop-blur-sm hover:scale-105 transition-all"
              >
                <Link href="/programs">View All Programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
