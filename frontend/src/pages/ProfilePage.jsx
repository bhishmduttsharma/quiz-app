import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Camera, Save, ShieldCheck, Target, Trophy, UserRound } from "lucide-react";
import Navbar from "../components/Navbar";
import { getAuthHeader } from "../utils/auth";
import { toast } from "react-toastify";
import { API_BASE } from "../config";
import { DashboardSkeleton } from "../components/UiStates";

const ProfilePage = () => {
  const authHeader = useMemo(() => getAuthHeader(), []);
  const [profile, setProfile] = useState({ name: "", email: "", college: "", bio: "", avatar: "" });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [profileResponse, analyticsResponse] = await Promise.all([
          axios.get(`${API_BASE}/api/auth/me`, { headers: authHeader }),
          axios.get(`${API_BASE}/api/results/analytics`, { headers: authHeader }),
        ]);
        setProfile(profileResponse.data.user || {});
        setStats(analyticsResponse.data.stats || {});
      } catch (err) {
        toast.error(err?.response?.data?.message || "Could not load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [authHeader]);

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 900 * 1024) {
      toast.error("Please upload an image below 900KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE}/api/auth/profile`, profile, {
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      window.dispatchEvent(new CustomEvent("authChanged", { detail: { user: response.data.user } }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Profile was not saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <section className="min-h-screen bg-[radial-gradient(circle_at_14%_10%,rgba(56,189,248,.16),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,.14),transparent_24%)] px-4 py-6 sm:px-6 md:pl-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-6">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
              Student Profile
            </p>
            <h1 className="text-3xl font-black md:text-5xl">Your learning identity</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Manage your profile, avatar, college details, and presentation-ready learning stats.
            </p>
          </div>

          {loading ? (
            <DashboardSkeleton cards={4} rows={1} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <form
                onSubmit={saveProfile}
                className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl"
              >
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/10">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                      ) : (
                        <UserRound size={54} className="text-cyan-100" />
                      )}
                    </div>
                    <label className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 shadow-lg">
                      <Camera size={14} />
                      Avatar
                      <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                    </label>
                  </div>
                  <p className="mt-6 text-lg font-black">{profile.name}</p>
                  <p className="text-sm text-slate-400">{profile.email}</p>
                </div>

                <label className="grid gap-2 text-sm font-bold text-slate-200">
                  Full name
                  <input
                    value={profile.name || ""}
                    onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300/40"
                  />
                </label>
                <label className="mt-4 grid gap-2 text-sm font-bold text-slate-200">
                  College
                  <input
                    value={profile.college || ""}
                    onChange={(event) => setProfile((current) => ({ ...current, college: event.target.value }))}
                    className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300/40"
                    placeholder="Your college name"
                  />
                </label>
                <label className="mt-4 grid gap-2 text-sm font-bold text-slate-200">
                  Bio
                  <textarea
                    value={profile.bio || ""}
                    onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                    className="min-h-28 resize-none rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-cyan-300/40"
                    placeholder="Frontend learner, backend explorer..."
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </form>

              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <ProfileStat icon={Trophy} label="Highest Score" value={`${stats.highestScore || 0}%`} />
                  <ProfileStat icon={Target} label="Accuracy" value={`${stats.accuracy || 0}%`} />
                  <ProfileStat icon={ShieldCheck} label="Global Rank" value={stats.currentRank ? `#${stats.currentRank}` : "--"} />
                  <ProfileStat icon={UserRound} label="Attempts" value={stats.totalAttempts || 0} />
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                  <h2 className="text-xl font-black">Presentation Highlights</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      "PDF certificate generation",
                      "Leaderboard and subject-wise ranking",
                      "Avatar-backed student profile",
                      "Daily challenge quiz workflow",
                      "Bookmark and review mode",
                      "Accuracy and weak-subject analytics",
                    ].map((item) => (
                      <div key={item} className="rounded-lg border border-white/10 bg-slate-950/35 p-4 text-sm font-bold text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
};

const ProfileStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/15 backdrop-blur-xl">
    <Icon className="mb-4 text-cyan-200" size={24} />
    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-black">{value}</p>
  </div>
);

export default ProfilePage;
