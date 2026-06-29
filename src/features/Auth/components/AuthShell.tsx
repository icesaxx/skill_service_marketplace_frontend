import { type ReactNode } from "react"
import { Buildings, ShieldCheck, Sparkle, UsersThree } from "@phosphor-icons/react"

import heroImage from "@/assets/hero.png"

type AuthShellProps = {
  children: ReactNode
  header?: ReactNode
}

const AuthShell = ({ children, header }: AuthShellProps) => {
  return (
    <main className="min-h-screen bg-[#f5f9ff] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden border-r border-[#bdd7ff] bg-[#102a56] text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(125,211,252,0.32),transparent_34%),linear-gradient(0deg,rgba(16,42,86,0.84),rgba(16,42,86,0.28))]" />
          <div className="relative flex min-h-screen flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center border border-[#bfdbfe]/40 bg-[#dbeafe]/12 text-[#93c5fd]">
                <Sparkle className="size-5" weight="fill" />
              </div>
              <div>
                <p className="text-sm font-semibold">SkillBridge</p>
                <p className="text-xs text-white/68">Talent Marketplace</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="max-w-xl space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7dd3fc]">
                  Hire faster. Work smarter.
                </p>
                <h2 className="text-4xl font-semibold leading-tight tracking-normal">
                  Find skilled professionals and turn open work into real results.
                </h2>
                <p className="max-w-lg text-sm leading-7 text-white/68">
                  Post jobs, discover trusted service providers, manage proposals, and keep client-provider
                  collaboration moving from one focused workspace.
                </p>
              </div>

              <div className="grid max-w-xl grid-cols-3 border border-[#bfdbfe]/24 bg-[#dbeafe]/10">
                <div className="border-r border-[#bfdbfe]/24 p-4">
                  <UsersThree className="mb-3 size-5 text-[#7dd3fc]" weight="bold" />
                  <p className="text-lg font-semibold">2.4k</p>
                  <p className="text-xs text-white/60">Freelancers</p>
                </div>
                <div className="border-r border-[#bfdbfe]/24 p-4">
                  <Buildings className="mb-3 size-5 text-[#fbbf24]" weight="bold" />
                  <p className="text-lg font-semibold">680</p>
                  <p className="text-xs text-white/60">Hiring teams</p>
                </div>
                <div className="p-4">
                  <ShieldCheck className="mb-3 size-5 text-[#a5b4fc]" weight="bold" />
                  <p className="text-lg font-semibold">99%</p>
                  <p className="text-xs text-white/60">Verified profiles</p>
                </div>
              </div>
            </div>

            <img
              src={heroImage}
              alt=""
              className="absolute bottom-8 right-8 w-56 opacity-90 drop-shadow-[0_24px_40px_rgba(0,0,0,0.38)]"
            />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(186,230,253,0.62),transparent_34%),linear-gradient(180deg,#ffffff,#eff6ff)] px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-155">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="lg:hidden">
                <p className="text-sm font-semibold text-[#1d4ed8]">SkillBridge</p>
                <p className="text-xs text-[#52647f]">Talent Marketplace</p>
              </div>
              {header}
            </div>

            <div className="border border-[#c7dcff] bg-white/95 p-5 shadow-[0_24px_70px_rgba(29,78,216,0.13)] sm:p-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthShell
