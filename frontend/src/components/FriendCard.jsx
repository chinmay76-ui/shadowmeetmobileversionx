import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  // Defensive: handle friend possibly being undefined
  if (!friend) return null;

  // normalize / fallback display values
  const genderValue = (friend.gender || "").toString().toLowerCase();
  const genderLabel =
    genderValue === "male"
      ? "Male"
      : genderValue === "female"
      ? "Female"
      : genderValue === "other"
      ? "Other"
      : "Not specified";

  const genderPrefix = genderValue === "male" ? "♂ " : genderValue === "female" ? "♀ " : "⚧ ";

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3 items-center">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage || "—"}
          </span>

          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage || "—"}
          </span>

          {/* Gender badge: always rendered (will show "Not specified" if none) */}
          <span className="badge badge-info text-xs">
            {genderPrefix}
            {genderLabel}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
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
