import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Ticket, Trophy, ShieldCheck, HeartHandshake } from "lucide-react"

export default function GuidePage() {
  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Guide</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="h-5 w-5 mr-2" />
            How to Play
          </CardTitle>
          <CardDescription>Learn how to play ORB Lotto and win prizes</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="pl-2">
              <span className="font-medium">Connect your WorldWallet</span>
              <p className="text-sm text-muted-foreground ml-6">
                Use the WorldWallet authentication to connect your wallet to ORB Lotto.
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Choose your lottery</span>
              <p className="text-sm text-muted-foreground ml-6">
                Select from $1 (Basic), $5 (Plus), $10 (Super), $100 (Mega), or $500 (Jackpot) lotteries. Higher value
                lotteries have bigger prizes!
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Buy your tickets</span>
              <p className="text-sm text-muted-foreground ml-6">
                Purchase up to 50 tickets per draw. Each ticket has a unique number format: 15G 12902 (Two digits, one
                letter, space, five digits).
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Wait for the draw</span>
              <p className="text-sm text-muted-foreground ml-6">
                Draws happen daily at 8:00 PM. Results are published immediately after the draw.
              </p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Check your winnings</span>
              <p className="text-sm text-muted-foreground ml-6">
                Visit your profile or the results page to see if you've won.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Prize Tiers
          </CardTitle>
          <CardDescription>Understanding how prizes are awarded</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-md">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                1st Prize (Jackpot)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Match the entire ticket number (e.g., 93A 29521). Receives 50% of the prize pool.
              </p>
            </div>

            <div className="p-3 border rounded-md">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                2nd Tier (10 winners)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Match the last 5 digits of the winning number (e.g., 29521). Each winner receives 3% of the prize pool.
              </p>
            </div>

            <div className="p-3 border rounded-md">
              <h3 className="font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-800" />
                3rd Tier (50 winners)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Match the last 4 digits of the winning number (e.g., 9521). Each winner receives 0.4% of the prize pool.
              </p>
            </div>

            <div className="p-3 border rounded-md bg-primary/10">
              <h3 className="font-semibold flex items-center">
                <HeartHandshake className="h-4 w-4 mr-2 text-primary" />
                ORB Lotto Foundation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                10% of every prize pool goes to the ORB Lotto Foundation, which supports community projects and
                charitable causes within the Worldcoin ecosystem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2" />
            Transparency
          </CardTitle>
          <CardDescription>How we ensure fairness and transparency</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Random Number Generation</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto uses a verifiable random function (VRF) to generate winning numbers. The random number
                  generation process is publicly auditable and cannot be manipulated by any party, including us.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Prize Distribution</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  60% of all ticket sales go directly to the prize pool, 10% goes to the ORB Lotto Foundation, and the
                  remaining 30% covers operational costs and development. Prize distribution is automated and executed
                  by smart contracts on the Worldcoin network.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Public Records</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  All draw results, ticket sales, and prize distributions are recorded on the blockchain and publicly
                  accessible. You can verify any past draw and see all tickets purchased for complete transparency.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Audit Reports</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">
                  ORB Lotto undergoes regular security audits by independent third parties. Audit reports are published
                  on our website and accessible to all users.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <h3 className="font-semibold flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Our Commitment
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              We are committed to providing a fair, transparent, and enjoyable lottery experience. If you have any
              questions or concerns about our practices, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
