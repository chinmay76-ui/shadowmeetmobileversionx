import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  if (!friend) return null;

  const genderValue = (friend.gender || "").toString().toLowerCase();
  const genderLabel =
    genderValue === "male"
      ? "Male"
      : genderValue === "female"
      ? "Female"
      : genderValue === "other"
      ? "Other"
      : "Not specified";

  const genderPrefix =
    genderValue === "male" ? "♂ " : genderValue === "female" ? "♀ " : "⚧ ";

  return (
    <div className="card bg-slate-900/80 border border-white/10 rounded-2xl text-sm">
      <div className="card-body p-3 sm:p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
          <div className="avatar size-10 sm:size-12 rounded-full overflow-hidden">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate text-sm sm:text-base">
            {friend.fullName}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3 items-center">
          <span className="badge badge-secondary badge-sm text-[10px] sm:text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage || "—"}
          </span>

          <span className="badge badge-outline badge-sm text-[10px] sm:text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage || "—"}
          </span>

          <span className="badge badge-info badge-sm text-[10px] sm:text-xs">
            {genderPrefix}
            {genderLabel}
          </span>
        </div>

        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-outline btn-sm w-full rounded-full"
        >
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
