import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  Target,
  Eye,
  Mail,
  Phone,
  ExternalLink,
  Award,
  Rocket,
  TrendingUp,
  Calendar,
  MapPin,
  Building,
  Star,
  CheckCircle,
  Instagram,
} from "lucide-react";
import { clubInfo, wings, Wing } from "@/data/clubInfo";

const normalizeWingName = (name: unknown) => {
  if (!name) return "";
  let value = name.toString().toLowerCase();

  // Treat "infra" / "infrastructure" as "core" so Infra wing
  // rows from the sheet map correctly to Core Wing in the UI.
  if (value.includes("infrastructure") || value.includes("infra")) {
    value = value.replace(/infrastructure/g, "core").replace(/infra/g, "core");
  }

  return value
    .replace(/wing/g, "")
    .replace(/[\s\-_.\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, "")
    .trim();
};

const getDriveImageUrl = (rawUrl: unknown) => {
  if (!rawUrl) return "";
  const url = rawUrl.toString().trim();

  // Matches: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/d\/([^/]+)\//);
  // Matches: https://drive.google.com/open?id=FILE_ID or ...?id=FILE_ID
  const queryMatch = url.match(/[?&]id=([^&]+)/);

  const fileId = fileMatch?.[1] ?? queryMatch?.[1];
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
};

const extractEmail = (value: unknown) => {
  if (!value) return "";
  const str = value.toString();

  const mailtoMatch = str.match(/mailto:([^\)\s]+)/i);
  if (mailtoMatch) return mailtoMatch[1];

  const emailMatch = str.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch ? emailMatch[0] : str.trim();
};

const extractFirstMatchingUrl = (value: unknown) => {
  if (!value) return "";
  const str = value.toString();

  // Handle markdown-style [text](url)
  const markdownMatch = str.match(/\((https?:\/\/[^\s)]+)\)/i);
  if (markdownMatch) return markdownMatch[1];

  const urlMatch = str.match(/https?:\/\/[^\s)]+/i);
  return urlMatch ? urlMatch[0] : str.trim();
};

const extractPhone = (value: unknown) => {
  if (!value) return "";
  const str = value.toString();
  const digits = str.replace(/[^\d+]/g, "");
  return digits;
};

const ClubPage = () => {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const teamApi = import.meta.env.VITE_TEAM_API;

    if (!teamApi) {
      const message = "VITE_TEAM_API is not defined";
      console.error(message);
      setFetchError(message);
      setIsLoading(false);
      return;
    }

    fetch(teamApi)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Team API response: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        const rawRows = Array.isArray(data) ? data : [];

        const cleaned = rawRows.filter((member) => {
          const name = (member["Display Name"] || "").toString().trim();
          const wingName = (member["Wing Name"] || member["wing name"] || "")
            .toString()
            .trim();
          return name && wingName;
        });

        setTeamData(cleaned);
      })
      .catch((err) => {
        console.error("Failed to fetch team data:", err);
        setFetchError(err.message || "Unknown error");
        setTeamData([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getWingMembers = (wingName) => {
    if (!wingName) return [];

    const normalizedWing = normalizeWingName(wingName);

    return teamData.filter((member) => {
      // Try common header names first
      let rawWingName =
        member["Wing Name"] ??
        member["wing name"] ??
        member["Wing"] ??
        member["wing"];

      // Fallback: any key that looks like a wing name column
      if (!rawWingName) {
        const wingKey = Object.keys(member).find((key) =>
          key.toLowerCase().includes("wing"),
        );
        if (wingKey) {
          rawWingName = member[wingKey as keyof typeof member];
        }
      }

      const memberWing = normalizeWingName(rawWingName || "");
      return (
        memberWing &&
        (memberWing.includes(normalizedWing) ||
          normalizedWing.includes(memberWing))
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{clubInfo.name}</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {clubInfo.tagline}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {clubInfo.totalMembers}+
                </div>
                <div className="text-blue-100">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {clubInfo.totalStartups}+
                </div>
                <div className="text-blue-100">Potential Startups</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {clubInfo.totalFunding}
                </div>
                <div className="text-blue-100">Funding Raise Target</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">
                  {clubInfo.outReach}
                </div>
                <div className="text-blue-100">Members Outreach</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wings">Wings Structure</TabsTrigger>
            <TabsTrigger value="team">Team Directory</TabsTrigger>
            <TabsTrigger value="join">Get Involved</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-blue-600" />
                  About VJ Startups Club
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vj-muted text-lg leading-relaxed mb-6">
                  {clubInfo.description}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-vj-primary mb-4">
                      <Target className="h-5 w-5 text-green-600" />
                      Our Mission
                    </h3>
                    <p className="text-vj-muted">{clubInfo.mission}</p>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-vj-primary mb-4">
                      <Eye className="h-5 w-5 text-purple-600" />
                      Our Vision
                    </h3>
                    <p className="text-vj-muted">{clubInfo.vision}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wings Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Our Eight Wings</CardTitle>
                <CardDescription>
                  Each wing adds different level of support to startups in our
                  ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {wings.map((wing) => (
                    <div
                      key={wing.id}
                      className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <h4 className="font-semibold text-vj-primary mb-2">
                        {wing.name}
                      </h4>
                      <p className="text-sm text-vj-muted mb-3">
                        {wing.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {getWingMembers(wing.name).length} Team Members
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wings Structure Tab */}
          <TabsContent value="wings" className="space-y-6">
            {wings.map((wing, index) => (
              <Card key={wing.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{wing.name}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {wing.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      Wing {index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Purpose */}
                    <div>
                      <h4 className="font-semibold text-vj-primary mb-2">
                        Purpose
                      </h4>
                      <p className="text-vj-muted">{wing.purpose}</p>
                    </div>

                    {/* Focus Areas */}
                    <div>
                      <h4 className="font-semibold text-vj-primary mb-3">
                        Focus Areas
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {wing.focusAreas.map((area, areaIndex) => (
                          <div
                            key={areaIndex}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-vj-muted">
                              {area}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements & Current Projects */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {wing.achievements && (
                        <div>
                          <h4 className="font-semibold text-vj-primary mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            Key Achievements
                          </h4>
                          <ul className="space-y-1">
                            {wing.achievements.map((achievement, achIndex) => (
                              <li
                                key={achIndex}
                                className="text-sm text-vj-muted flex items-center gap-2"
                              >
                                <Star className="h-3 w-3 text-yellow-500" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {wing.currentProjects && (
                        <div>
                          <h4 className="font-semibold text-vj-primary mb-3 flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-blue-600" />
                            Current Projects
                          </h4>
                          <ul className="space-y-1">
                            {wing.currentProjects.map((project, projIndex) => (
                              <li
                                key={projIndex}
                                className="text-sm text-vj-muted flex items-center gap-2"
                              >
                                <TrendingUp className="h-3 w-3 text-blue-500" />
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Contact */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-vj-primary mb-2">
                        Contact This Wing
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-vj-muted">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${wing.contactEmail}`}
                          className="hover:text-blue-600"
                        >
                          {wing.contactEmail}
                        </a>
                      </div>
                    </div>

                    {/* Sub-Wings (if available) */}
                    {wing.subWings && wing.subWings.length > 0 && (
                      <div>
                        <Separator className="my-6" />
                        <Accordion type="multiple" className="w-full">
                          <AccordionItem
                            value="sub-wings"
                            className="border-none"
                          >
                            <AccordionTrigger className="hover:no-underline py-3">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-purple-600" />
                                <span className="font-semibold text-vj-primary">
                                  Program Sub-Wings ({wing.subWings.length})
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                              <div className="grid gap-4 mt-4">
                                {wing.subWings.map((subWing) => (
                                  <div
                                    key={subWing.id}
                                    className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h5 className="font-medium text-vj-primary">
                                          {subWing.name}
                                        </h5>
                                        <p className="text-sm text-vj-muted mt-1">
                                          {subWing.description}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Badge
                                          variant={
                                            subWing.status === "active"
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {subWing.status}
                                        </Badge>
                                        {subWing.edition && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Season {subWing.edition}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-vj-primary">
                                          Team Lead:
                                        </span>
                                        <div className="text-vj-muted mt-1">
                                          {subWing.teamLead.name} -{" "}
                                          {subWing.teamLead.role}
                                          <br />
                                          <span className="text-xs">
                                            {subWing.teamLead.branch},{" "}
                                            {subWing.teamLead.year}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium text-vj-primary">
                                          Team Size:
                                        </span>
                                        <div className="text-vj-muted mt-1">
                                          {subWing.team.length + 1} members
                                        </div>

                                        {subWing.currentActivity && (
                                          <div className="mt-2">
                                            <span className="font-medium text-vj-primary">
                                              Current Activity:
                                            </span>
                                            <div className="text-vj-muted text-xs mt-1">
                                              {subWing.currentActivity}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {subWing.achievements &&
                                      subWing.achievements.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                          <span className="font-medium text-vj-primary text-xs">
                                            Key Achievements:
                                          </span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {subWing.achievements
                                              .slice(0, 2)
                                              .map((achievement, achIdx) => (
                                                <span
                                                  key={achIdx}
                                                  className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded"
                                                >
                                                  {achievement}
                                                </span>
                                              ))}
                                            {subWing.achievements.length >
                                              2 && (
                                              <span className="text-xs text-vj-muted">
                                                +
                                                {subWing.achievements.length -
                                                  2}{" "}
                                                more
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                      <div className="flex items-center gap-2 text-xs text-vj-muted">
                                        <Mail className="h-3 w-3" />
                                        <a
                                          href={`mailto:${subWing.contactEmail}`}
                                          className="hover:text-blue-600"
                                        >
                                          {subWing.contactEmail}
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Team Directory Tab */}
          <TabsContent value="team" className="space-y-6">
            {isLoading && (
              <p className="text-center text-vj-muted">
                Loading team members...
              </p>
            )}
            {!isLoading && fetchError && (
              <p className="text-center text-red-500">
                Failed to load team: {fetchError}
              </p>
            )}

            {!isLoading && !fetchError && (
              <div className="text-center text-xs text-vj-muted mb-4">
                Loaded {teamData.length} rows from sheet, showing members per
                wing.
              </div>
            )}

            {!isLoading &&
              !fetchError &&
              wings.map((wing) => {
                const members = getWingMembers(wing.name);
                if (!members || members.length === 0) return null;

                const wingMasters = members.filter((member) =>
                  (member["Role"] || "")
                    .toString()
                    .toLowerCase()
                    .includes("wing master"),
                );
                const coreMembers = members.filter(
                  (member) =>
                    !(member["Role"] || "")
                      .toString()
                      .toLowerCase()
                      .includes("wing master"),
                );

                const primaryWingMaster = wingMasters[0];

                return (
                  <Card
                    key={wing.id}
                    className="bg-gradient-to-b from-slate-900/80 to-slate-900 text-white border-slate-800"
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {wing.name}{" "}
                        <span className="text-sm text-slate-300">- Team</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        {wing.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {primaryWingMaster && (
                        <div className="rounded-2xl bg-slate-800/80 border border-blue-500/60 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                          {(() => {
                            const displayName =
                              primaryWingMaster["Display Name"] || "-";
                            const photoUrl = getDriveImageUrl(
                              primaryWingMaster["Photo (Drive link)"] ||
                                primaryWingMaster["Photo"] ||
                                primaryWingMaster["photo"],
                            );
                            const email = extractEmail(
                              primaryWingMaster["email-id"] ||
                                primaryWingMaster["email"] ||
                                primaryWingMaster["Email"] ||
                                "",
                            );
                            const linkedinUrl = extractFirstMatchingUrl(
                              primaryWingMaster["LInkedin (ifany)"] ||
                                primaryWingMaster["Linkedin (ifany)"] ||
                                primaryWingMaster["Linkedin"] ||
                                "",
                            );
                            const instaUrl = extractFirstMatchingUrl(
                              primaryWingMaster["Insta (optional)"] ||
                                primaryWingMaster["Insta"] ||
                                "",
                            );
                            const phoneNumber = extractPhone(
                              primaryWingMaster[
                                "Phone Number (must for - Wing Master)"
                              ] ||
                                primaryWingMaster["Phone Number"] ||
                                "",
                            );

                            return (
                              <>
                                <div className="flex-shrink-0">
                                  {photoUrl ? (
                                    <img
                                      src={photoUrl}
                                      alt={displayName}
                                      className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                                      {displayName.toString().charAt(0) || "?"}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                      <h3 className="text-xl font-semibold">
                                        {displayName}
                                      </h3>
                                      <p className="text-sm text-sky-300">
                                        {primaryWingMaster["Role"] || ""}
                                      </p>
                                      <p className="text-xs text-slate-300 mt-1">
                                        {primaryWingMaster["Department"] || ""}{" "}
                                        {primaryWingMaster["Year"]
                                          ? `• ${primaryWingMaster["Year"]}`
                                          : ""}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="border-blue-400 text-blue-200 text-xs"
                                    >
                                      Wing Master
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                                    {email && (
                                      <a
                                        href={`mailto:${email}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/20 text-blue-200 hover:bg-blue-600/40"
                                      >
                                        <Mail className="h-3 w-3" />
                                        Email
                                      </a>
                                    )}
                                    {phoneNumber && (
                                      <a
                                        href={`tel:${phoneNumber}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/40"
                                      >
                                        <Phone className="h-3 w-3" />
                                        {phoneNumber}
                                      </a>
                                    )}
                                    {linkedinUrl && (
                                      <a
                                        href={linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-700 text-slate-100 hover:bg-slate-600"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        LinkedIn
                                      </a>
                                    )}
                                    {instaUrl && (
                                      <a
                                        href={instaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 hover:bg-pink-500/40"
                                      >
                                        <Instagram className="h-3 w-3" />
                                        Instagram
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {coreMembers.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                            Core Team Members
                          </h4>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {coreMembers.map((member, index) => {
                              const displayName =
                                member["Display Name"] || "Name not set";
                              const photoUrl = getDriveImageUrl(
                                member["Photo (Drive link)"] ||
                                  member["Photo"] ||
                                  member["photo"],
                              );
                              const email = extractEmail(
                                member["email-id"] ||
                                  member["email"] ||
                                  member["Email"] ||
                                  "",
                              );
                              const linkedinUrl = extractFirstMatchingUrl(
                                member["LInkedin (ifany)"] ||
                                  member["Linkedin (ifany)"] ||
                                  member["Linkedin"] ||
                                  "",
                              );
                              const phoneNumber = extractPhone(
                                member["Phone Number"] || "",
                              );
                              const instaUrl = extractFirstMatchingUrl(
                                member["Insta (optional)"] ||
                                  member["Insta"] ||
                                  "",
                              );

                              return (
                                <div
                                  key={`${wing.id}-core-${index}`}
                                  className="rounded-xl bg-slate-800/80 border border-slate-700 p-4 flex gap-3"
                                >
                                  {photoUrl ? (
                                    <img
                                      src={photoUrl}
                                      alt={displayName}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-100 font-semibold">
                                      {displayName.toString().charAt(0) || "?"}
                                    </div>
                                  )}

                                  <div className="flex-1">
                                    <h5 className="text-sm font-semibold text-white">
                                      {displayName}
                                    </h5>
                                    <p className="text-xs text-slate-300">
                                      {member["Role"] || ""}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                      {member["Department"] || ""}{" "}
                                      {member["Year"]
                                        ? `• ${member["Year"]}`
                                        : ""}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                                      {email && (
                                        <a
                                          href={`mailto:${email}`}
                                          className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200"
                                        >
                                          <Mail className="h-3 w-3" />
                                          Email
                                        </a>
                                      )}
                                      {linkedinUrl && (
                                        <a
                                          href={linkedinUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          LinkedIn
                                        </a>
                                      )}
                                      {phoneNumber && (
                                        <a
                                          href={`tel:${phoneNumber}`}
                                          className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                                        >
                                          <Phone className="h-3 w-3" />
                                          {phoneNumber}
                                        </a>
                                      )}
                                      {instaUrl && (
                                        <a
                                          href={instaUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-pink-300 hover:text-pink-200"
                                        >
                                          <Instagram className="h-3 w-3" />
                                          Instagram
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

            {!isLoading && !fetchError && teamData.length === 0 && (
              <p className="text-center text-vj-muted">
                No team members loaded yet.
              </p>
            )}
          </TabsContent>

          {/* Get Involved Tab */}
          <TabsContent value="join" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Join VJ Startups Club
                </CardTitle>
                <CardDescription>
                  Be part of VNRVJIET's most dynamic entrepreneurship community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-vj-primary mb-4">
                      Why Join Us?
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Access to industry mentors and experts
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Funding opportunities and investor connects
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Practical entrepreneurship experience
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Strong alumni and industry network
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Leadership and teamwork skills development
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-vj-primary mb-4">
                      How to Join
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Fill Registration Form
                          </p>
                          <p className="text-xs text-vj-muted">
                            Complete our online registration with your interests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          2
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Attend Orientation
                          </p>
                          <p className="text-xs text-vj-muted">
                            Join our monthly orientation session
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          3
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Choose Your Wing
                          </p>
                          <p className="text-xs text-vj-muted">
                            Select the wing that matches your interests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          4
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Start Your Journey
                          </p>
                          <p className="text-xs text-vj-muted">
                            Begin participating in programs and events
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="text-center">
                  <h3 className="font-semibold text-vj-primary mb-4">
                    Ready to Start Your Entrepreneurial Journey?
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Mail className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                    <Button variant="outline" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Attend Next Meetup
                    </Button>
                  </div>

                  <div className="mt-6 text-sm text-vj-muted">
                    <p>
                      Have questions? Contact us at{" "}
                      <a
                        href="mailto:head.iie+questions@vnrvjiet.in"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        head.iie+questions@vnrvjiet.in
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClubPage;
