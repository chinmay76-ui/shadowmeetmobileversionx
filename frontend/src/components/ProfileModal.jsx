// src/components/ProfileModal.jsx
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

export default function ProfileModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [profilePicBase64, setProfilePicBase64] = useState(null);
  const [learningLanguage, setLearningLanguage] = useState("");
  const [fullName, setFullName] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Fetch current user when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function fetchUser() {
      try {
        const res = await axiosInstance.get("/users/me");
        const u = res.data;

        setUser(u);
        setPreview(u.profilePic || "");
        setLearningLanguage(u.learningLanguage || "");
        setFullName(u.fullName || "");
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }

    fetchUser();
  }, [isOpen]);

  // Convert selected image to Base64
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setProfilePicBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const updates = {
        fullName,
        learningLanguage,
        profilePic: profilePicBase64 || user.profilePic,
      };

      const userId = user._id || user.id;

      const res = await axiosInstance.put(`/users/${userId}`, updates, {
        headers: { "Content-Type": "application/json" },
      });

      // Auto reload to refresh sidebar avatar and name
      setTimeout(() => {
        window.location.reload();
      }, 400);

      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[10000] w-full max-w-lg bg-base-100 rounded-xl shadow-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Edit Profile(under maintainance dont change)</h2>

        {/* Profile photo */}
        <div>
          <p className="text-sm mb-2">Profile Photo</p>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-base-200 border">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-base-300" />
              )}
            </div>

            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="text-sm">Full Name</label>
          <input
            type="text"
            className="input input-bordered w-full mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Learning Language */}
        <div>
          <label className="text-sm">Learning Language</label>
          <input
            type="text"
            className="input input-bordered w-full mt-1"
            value={learningLanguage}
            onChange={(e) => setLearningLanguage(e.target.value)}
            placeholder="e.g. Spanish"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}