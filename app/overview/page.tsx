"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMember, useGuildWarStore } from "@/stores/eventStore";
import { useEffect, useMemo, useState } from "react";

type Role = "Healer" | "DPS" | "Tank";

type AvailabilityStatus = "Participating" | "assigned" | "notParticipating";

const SLOT_START_MINUTES = 19 * 60 + 30;
const SLOT_END_MINUTES = 22 * 60 + 30;
const SLOT_STEP_MINUTES = 30;

const roleStyles: Record<Role, string> = {
  Healer:
    "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-900",
  DPS: "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-900",
  Tank: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-900"
};

const statusStyles: Record<AvailabilityStatus, string> = {
  Participating:
    "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100",
  assigned:
    "bg-indigo-200/80 text-indigo-900 dark:bg-indigo-500/30 dark:text-indigo-100",
  notParticipating: "bg-slate-50 text-slate-400 dark:bg-slate-900/40"
};

const formatTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatLocalDate = (timeZone: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone
  }).format(new Date());

const OverviewPage = () => {
  const [activeRegion, setActiveRegion] = useState<"VN" | "NA">("VN");
  const [activeDay, setActiveDay] = useState<"sat" | "sun">("sat");
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchEvent = useGuildWarStore(state => state.fetchEvent);
  const vnMembers = useGuildWarStore(state => state.VN.availableUsers);
  const naMembers = useGuildWarStore(state => state.NA.availableUsers);
  const vnTeams = useGuildWarStore(state => state.VN.teams);
  const naTeams = useGuildWarStore(state => state.NA.teams);
  const members = activeRegion === "VN" ? vnMembers : naMembers;
  const teams = activeRegion === "VN" ? vnTeams : naTeams;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchEvent(activeRegion);
  }, [activeRegion, fetchEvent]);

  const timeZone =
    activeRegion === "VN" ? "Asia/Ho_Chi_Minh" : "America/New_York";
  const serverTimeLabel =
    activeRegion === "VN"
      ? "Server Time: UTC+7 (Asia/Ho_Chi_Minh)"
      : "Server Time: GMT-5 (America/New_York)";

  const localDateLabel = useMemo(() => formatLocalDate(timeZone), [timeZone]);
  // Format current time for the selected timezone
  const currentTimeLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone
    }).format(currentTime);
  }, [currentTime, timeZone]);

  const dayKey = activeDay;

  const slots = useMemo(() => {
    const items: { start: string; end: string; label: string }[] = [];
    for (
      let minutes = SLOT_START_MINUTES;
      minutes < SLOT_END_MINUTES;
      minutes += SLOT_STEP_MINUTES
    ) {
      const start = formatTime(minutes);
      const end = formatTime(minutes + SLOT_STEP_MINUTES);
      items.push({ start, end, label: start });
    }
    return items;
  }, []);

  const roleTotals = useMemo(() => {
    const totals = { healer: 0, tank: 0, dps: 0 };
    members.forEach(member => {
      if (member.primaryRole === "Healer") totals.healer += 1;
      if (member.primaryRole === "Tank") totals.tank += 1;
      if (member.primaryRole === "DPS") totals.dps += 1;
    });
    return totals;
  }, [members]);

  const assignedMemberMap = useMemo(() => {
    const map = new Map<string, string>();
    const targetDay = activeDay === "sat" ? "saturday" : "sunday";
    teams
      .filter(team => team.day === targetDay)
      .forEach(team => {
        team.members.forEach(member => {
          if (!map.has(member.id)) {
            map.set(member.id, team.name);
          }
        });
      });
    return map;
  }, [activeDay, teams]);

  const availabilityGrid = useMemo(
    () =>
      members.map(member =>
        slots.map(slot => {
          const isAvailable = member.timeSlots.includes(
            `${dayKey}_${slot.start}-${slot.end}` as TeamMember["timeSlots"][number]
          );
          if (!isAvailable) return "notParticipating";
          return assignedMemberMap.has(member.id)
            ? "assigned"
            : "Participating";
        })
      ),
    [assignedMemberMap, dayKey, members, slots]
  );

  const gridTemplateColumns = useMemo(
    () => `200px repeat(${slots.length}, 1fr)`,
    [slots.length]
  );

  return (
    <main className="max-w-7xl lg:max-w-[85%] min-h-screen mx-auto py-8 lg:py-16 px-4 space-y-6 lg:space-y-10">
      <section className="space-y-4">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Guild War Overview
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                Guild War Member Availability Overview
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                View the availability of guild members for Guild War events,
                organized by server region and day. Easily identify who is
                Participating, assigned, or Not Participating for each time
                slot.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1 bg-muted/40">
                {localDateLabel}
              </span>
              <span className="rounded-full border border-border px-3 py-1 bg-muted/40">
                Region: {activeRegion}
              </span>
              <span className="rounded-full border border-border px-3 py-1 bg-muted/40">
                {serverTimeLabel}
              </span>
              <span className="rounded-full border border-border px-3 py-1 bg-muted/40 font-mono">
                {currentTimeLabel}
              </span>
            </div>
          </div>
        </div>

        <Tabs
          value={activeRegion}
          onValueChange={value => setActiveRegion(value as "VN" | "NA")}
          className="w-fit"
        >
          <TabsList className="grid grid-cols-2 w-55">
            <TabsTrigger value="VN">VN Server</TabsTrigger>
            <TabsTrigger value="NA">NA Server</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={activeDay}
          onValueChange={value => setActiveDay(value as "sat" | "sun")}
          className="w-fit"
        >
          <TabsList className="grid grid-cols-2 w-55">
            <TabsTrigger value="sat">Saturday</TabsTrigger>
            <TabsTrigger value="sun">Sunday</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-500/40" />
            Participating
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-indigo-200 dark:bg-indigo-500/40" />
            Assigned
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-900/40" />
            Not Participating
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 text-sm font-medium text-muted-foreground">
          Totals: DPS {roleTotals.dps}, Healer {roleTotals.healer}, Tank{" "}
          {roleTotals.tank}
        </div>
        <div className="overflow-auto">
          <div className="min-w-max">
            <div
              className="grid text-xs font-semibold uppercase text-muted-foreground sticky top-0 z-10 bg-card"
              style={{ gridTemplateColumns }}
            >
              <div className="sticky left-0 bg-card border-b border-border px-4 py-3">
                Members
              </div>
              {slots.map(slot => (
                <div
                  key={slot.start}
                  className="border-b border-border px-3 py-3 text-center bg-muted/40"
                >
                  {slot.start} - {slot.end}
                </div>
              ))}
            </div>

            {members.map((member, memberIndex) => (
              <div
                key={member.id}
                className="grid text-sm border-b border-border last:border-0 last:rounded-b-2xl overflow-hidden"
                style={{ gridTemplateColumns }}
              >
                <div className="sticky left-0 z-10 bg-card px-4 py-3 border-r border-border flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {member.name}
                  </span>
                  <span
                    className={`text-[11px] uppercase tracking-wide border rounded-full px-2 py-0.5 ${roleStyles[member.primaryRole as Role]}`}
                  >
                    {member.primaryRole}
                  </span>
                </div>
                {availabilityGrid[memberIndex].map((status, slotIndex) => {
                  const slot = slots[slotIndex];
                  const assignedTeam = assignedMemberMap.get(member.id);
                  return (
                    <div
                      key={`${member.id}-${slotIndex}`}
                      title={`${member.name} - ${member.primaryRole} - ${status}`}
                      className={`relative px-2 py-3 text-center text-[11px] border-r border-border ${statusStyles[status]}`}
                    >
                      {status === "notParticipating" && (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-semibold">
                            Not Participating
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {slot.start}-{slot.end}
                          </span>
                        </div>
                      )}
                      {status === "Participating" && (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-semibold">Participating</span>
                          <span className="text-[10px] text-muted-foreground">
                            {slot.start}-{slot.end}
                          </span>
                        </div>
                      )}
                      {status === "assigned" && (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-semibold">
                            Assigned {assignedTeam ? `- ${assignedTeam}` : ""}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {slot.start}-{slot.end}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default OverviewPage;
