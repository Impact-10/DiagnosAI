import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Globe, Users } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Trusted Sources",
    description:
      "Information sourced from WHO, CDC, and peer-reviewed medical literature for accuracy and reliability.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Get health information anytime, anywhere. No waiting rooms or appointment scheduling required.",
  },
  {
    icon: Globe,
    title: "Disease Awareness",
    description: "Stay informed about current health threats, prevention methods, and outbreak information.",
  },
  {
    icon: Users,
    title: "Personalized Guidance",
    description: "Receive tailored health recommendations based on your specific questions and concerns.",
  },
]

export function FeatureCards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="text-center hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
