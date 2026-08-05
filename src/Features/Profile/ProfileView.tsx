import { useState } from "react";
import { Database, LogOut, Mail, MailX, MessageCircle, User as UserIcon, ChevronRight } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { useGmailAuthContext } from "../../context/GmailAuthContext";
import { useProfile } from "../../hooks/useProfile";
import { useView } from "../../context/ViewContext";
import { useGoogleUnverifiedNotice } from "../Onboarding/useGoogleUnverifiedNotice";
import GoogleUnverifiedNotice from "../Onboarding/GoogleUnverifiedNotice";
import AccountDataModal from "../../Components/NavBar/AccountDataModal/AccountDataModal";
import GoogleHeadsUpNotice from "../../Components/GoogleHeadsUpNotice/GoogleHeadsUpNotice";
import FeedbackPanel from "../../Components/FeedbackButton/FeedbackPanel";
import ProfileHeader from "./ProfileHeader";
import FabricProfileCard from "./FabricProfileCard";
import { appVersion } from "../../lib/monitoring";
import LegalLinks from "../../Components/LegalLinks/LegalLinks";
import "./ProfileView.css";

interface ProfileRowButtonProps {
	icon: React.ReactNode;
	label: string;
	sub?: string;
	onClick: () => void;
}

function ProfileRowButton({ icon, label, sub, onClick }: ProfileRowButtonProps) {
	return (
		<button type="button" className="profile__row" onClick={onClick}>
			<span className="profile__row-icon">{icon}</span>
			<span className="profile__row-main">
				{label}
				{sub && <span className="profile__row-sub">{sub}</span>}
			</span>
			<ChevronRight size={16} aria-hidden="true" className="profile__row-chevron" />
		</button>
	);
}

/**
 * Minimal beta profile page (opened from the top-bar avatar): identity from
 * the Google-seeded profiles row, Account & Data, feedback, sign out, version.
 * Uses the same card language as the E12 profile-hub mockup so post-beta
 * sections (locations, measurements, sharing) can join the list unchanged.
 */
export default function ProfileView() {
	const { user, isAuthenticated, signIn, signOut, isLoading } = useSupabaseAuthContext();
	const { isAuthenticated: gmailConnected, logout: disconnectGmail } = useGmailAuthContext();
	const { profile, updateDisplayName } = useProfile();
	const { setView } = useView();
	const googleNotice = useGoogleUnverifiedNotice();
	const [accountModalOpen, setAccountModalOpen] = useState(false);
	const [feedbackOpen, setFeedbackOpen] = useState(false);

	const handleSignOut = async () => {
		await signOut();
		setView("carousel");
	};

	if (!isAuthenticated || !user) {
		return (
			<div className="profile">
				<div className="profile__header">
					<div className="profile__avatar profile__avatar--empty" aria-hidden="true">
						<UserIcon size={24} />
					</div>
					{/* h2 to match ProfileHeader's signed-in state — see comment there. */}
					<h2 className="profile__name">Your profile</h2>
					<p className="profile__meta">Sign in to sync your closet. Connect Gmail separately to import.</p>
					<button
						type="button"
						className="profile__signin-btn"
						onClick={() => googleNotice.requestGoogleSignIn(() => void signIn())}
						disabled={isLoading}
					>
						Sign in with Google
					</button>
					<GoogleHeadsUpNotice />
				</div>
				<GoogleUnverifiedNotice isOpen={googleNotice.isOpen} onContinue={googleNotice.confirm} onCancel={googleNotice.dismiss} />
				<p className="profile__version">Nothing To Wear · {appVersion()}</p>
				<LegalLinks />
			</div>
		);
	}

	return (
		<div className="profile">
			<ProfileHeader profile={profile} user={user} onSaveName={updateDisplayName} />

			<FabricProfileCard />

			<div className="profile__rows">
				{gmailConnected ? (
					<ProfileRowButton
						icon={<Mail size={17} aria-hidden="true" />}
						label="Gmail connected"
						sub="Read-only, resets each visit — disconnect"
						onClick={() => disconnectGmail()}
					/>
				) : (
					<ProfileRowButton
						icon={<MailX size={17} aria-hidden="true" />}
						label="Gmail not connected"
						sub="Connect to import order confirmations"
						onClick={() => setView("gmail")}
					/>
				)}
				<ProfileRowButton
					icon={<Database size={17} aria-hidden="true" />}
					label="Account and data"
					sub="Download or delete everything"
					onClick={() => setAccountModalOpen(true)}
				/>
				<ProfileRowButton
					icon={<MessageCircle size={17} aria-hidden="true" />}
					label="Send feedback"
					sub="Tell us what's confusing"
					onClick={() => setFeedbackOpen(true)}
				/>
				<ProfileRowButton icon={<LogOut size={17} aria-hidden="true" />} label="Sign out" onClick={() => void handleSignOut()} />
			</div>

			<AccountDataModal isOpen={accountModalOpen} onClose={() => setAccountModalOpen(false)} />
			{feedbackOpen && (
				<div className="feedback">
					<FeedbackPanel onClose={() => setFeedbackOpen(false)} />
				</div>
			)}

			<p className="profile__version">Nothing To Wear · {appVersion()}</p>
			<LegalLinks />
		</div>
	);
}
