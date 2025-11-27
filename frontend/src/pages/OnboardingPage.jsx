// src/pages/OnboardingPage.jsx
import { useState, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding, uploadAvatar } from "../lib/api";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  CameraIcon,
} from "lucide-react";
import { LANGUAGES } from "../constants";

const TEST_IMAGE = "sandbox:/mnt/data/f1098ea5-4f95-4529-b656-5660e41dc464.png";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || TEST_IMAGE,
    gender: authUser?.gender || "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Onboarding failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formState.fullName ||
      !formState.bio ||
      !formState.nativeLanguage ||
      !formState.learningLanguage ||
      !formState.location ||
      !formState.gender
    ) {
      toast.error("Please fill all fields including gender");
      return;
    }

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState((prev) => ({ ...prev, profilePic: randomAvatar }));
    toast.success("Random profile picture generated!");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const data = await uploadAvatar(file);
      if (data?.url) {
        setFormState((prev) => ({ ...prev, profilePic: data.url }));
        toast.success("Profile picture uploaded!");
      } else {
        toast.error("Upload succeeded but no url returned");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-tree-hero relative flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      {/* subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative w-full max-w-3xl">
        <div className="card bg-black/80 text-red-100 rounded-3xl shadow-2xl border border-white/10">
          <div className="card-body p-5 sm:p-7 md:p-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-7">
              Complete Your Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
              {/* PROFILE PIC */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="size-28 sm:size-32 rounded-full bg-base-300 overflow-hidden border border-white/20">
                  {formState.profilePic ? (
                    <img
                      src={formState.profilePic}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CameraIcon className="size-10 sm:size-12 text-base-content opacity-40" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarUpload}
                />

                <div className="flex flex-wrap items-center gap-2 justify-center">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRandomAvatar}
                    className="btn btn-accent btn-sm"
                    disabled={uploadingAvatar}
                  >
                    <ShuffleIcon className="size-4 mr-1.5" />
                    Generate Random Avatar
                  </button>
                </div>
              </div>

              {/* FULL NAME */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-red-200">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({ ...formState, fullName: e.target.value })
                  }
                  className="input input-bordered w-full bg-black/40 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Your full name"
                />
              </div>

              {/* BIO */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-red-200">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) =>
                    setFormState({ ...formState, bio: e.target.value })
                  }
                  className="textarea textarea-bordered h-24 bg-black/40 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Tell others about yourself and your language learning goals"
                />
              </div>

              {/* LANGUAGES + GENDER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-red-200">
                      Native Language
                    </span>
                  </label>
                  <select
                    name="nativeLanguage"
                    value={formState.nativeLanguage}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        nativeLanguage: e.target.value,
                      })
                    }
                    className="select select-bordered w-full bg-black/40 border-white/30 text-white"
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-red-200">
                      Learning Language
                    </span>
                  </label>
                  <select
                    name="learningLanguage"
                    value={formState.learningLanguage}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        learningLanguage: e.target.value,
                      })
                    }
                    className="select select-bordered w-full bg-black/40 border-white/30 text-white"
                  >
                    <option value="">Select language you're learning</option>
                    {LANGUAGES.map((lang) => (
                      <option
                        key={`learning-${lang}`}
                        value={lang.toLowerCase()}
                      >
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-red-200">Gender</span>
                  </label>
                  <select
                    name="gender"
                    value={formState.gender}
                    onChange={(e) =>
                      setFormState({ ...formState, gender: e.target.value })
                    }
                    className="select select-bordered w-full bg-black/40 border-white/30 text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* LOCATION */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-red-200">Location</span>
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-5 text-base-200" />
                  <input
                    type="text"
                    name="location"
                    value={formState.location}
                    onChange={(e) =>
                      setFormState({ ...formState, location: e.target.value })
                    }
                    className="input input-bordered w-full pl-10 bg-black/40 border-white/30 text-white placeholder:text-white/70"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <button
                className="btn btn-primary w-full mt-2"
                disabled={isPending}
                type="submit"
              >
                {!isPending ? (
                  <>
                    <ShipWheelIcon className="size-5 mr-2" />
                    Complete Onboarding
                  </>
                ) : (
                  <>
                    <LoaderIcon className="animate-spin size-5 mr-2" />
                    Onboarding...
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
