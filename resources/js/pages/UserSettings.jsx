import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Plus, Trash2, Edit2, Save, User, Lock, AlertTriangle, ChevronRight, CheckCircle, X } from "lucide-react";

export function UserSettings() {
    const [error, setError] = useState(null);
    const { user, logout, token, checkAuth } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        bio: "",
        profile_pic: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || "",
                profile_pic: user.profile_pic || "",
            });
        }
    }, [user, navigate]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) throw new Error("Session expired");

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.put(
                "/api/user/profile",
                {
                    name: profileData.name,
                    email: profileData.email,
                    bio: profileData.bio,
                    profile_pic: profileData.profile_pic,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            setSuccessMessage("Profile updated successfully");
        } catch (error) {
            console.error("Profile update error:", error);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                await logout();
                navigate("/login");
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: "An error occurred. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        if (passwordData.password !== passwordData.password_confirmation) {
            setErrors({ password_confirmation: "Passwords do not match" });
            setIsLoading(false);
            return;
        }

        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) throw new Error("Session expired");

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.post(
                "/api/user/password",
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            setSuccessMessage("Password updated successfully");
            setPasswordData({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } catch (error) {
            console.error("Password update error:", error);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                await logout();
                navigate("/login");
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: "An error occurred. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== "DELETE") return;

        setIsLoading(true);
        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) throw new Error("Session expired");

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.delete("/api/user", {
                data: { confirmation: "DELETE" },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                withCredentials: true,
            });

            if (response.data.success) {
                await logout();
                navigate("/", {
                    state: {
                        accountDeleted: true,
                        message: "Your account has been permanently deleted",
                    },
                });
            }
        } catch (error) {
            console.error("Account deletion error:", error);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                await logout();
                navigate("/login");
            } else {
                alert(
                    error.response?.data?.message ||
                        "Failed to delete account. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-accent-light dark:from-cyber-pink dark:to-cyber-purple bg-clip-text text-transparent mb-2">
                    Account Settings
                </h1>
                <p className="text-textLight dark:text-textDark">
                    Manage your profile, security, and account preferences
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="p-6 rounded-2xl bg-lightBg/80 dark:bg-cyber-dark/80 shadow-lg border border-brown-light/30 dark:border-cyber-purple/50 backdrop-blur-sm">
                        <div className="flex items-center mb-6 pb-4 border-b border-brown-light/20 dark:border-cyber-cyan/20">
                            <div className="relative">
                                <img
                                    src={profileData.profile_pic || "/images/default-avatar.png"}
                                    alt="Profile"
                                    className="w-14 h-14 rounded-full object-cover border-2 border-accent/50 dark:border-cyber-cyan/60"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent dark:bg-cyber-cyan flex items-center justify-center">
                                    <User size={12} className="text-white" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="font-semibold text-heading dark:text-cyber-cyan">{user.name}</h3>
                                <p className="text-sm text-textLight dark:text-textDark">{user.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all duration-300 ${
                                    activeTab === "profile"
                                        ? "bg-accent text-white dark:bg-cyber-cyan dark:text-cyber-black shadow-lg"
                                        : "text-textLight dark:text-textDark hover:bg-brown-light/10 dark:hover:bg-cyber-cyan/10"
                                }`}
                            >
                                <div className="flex items-center">
                                    <User size={16} className="mr-3" />
                                    <span>Profile</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            
                            <button
                                onClick={() => setActiveTab("password")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all duration-300 ${
                                    activeTab === "password"
                                        ? "bg-accent text-white dark:bg-cyber-cyan dark:text-cyber-black shadow-lg"
                                        : "text-textLight dark:text-textDark hover:bg-brown-light/10 dark:hover:bg-cyber-cyan/10"
                                }`}
                            >
                                <div className="flex items-center">
                                    <Lock size={16} className="mr-3" />
                                    <span>Password</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            
                            <button
                                onClick={() => setActiveTab("danger")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all duration-300 ${
                                    activeTab === "danger"
                                        ? "bg-red-600 text-white dark:bg-red-700 shadow-lg"
                                        : "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
                                }`}
                            >
                                <div className="flex items-center">
                                    <AlertTriangle size={16} className="mr-3" />
                                    <span>Danger Zone</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="p-8 rounded-2xl bg-lightBg/80 dark:bg-cyber-dark/80 shadow-lg border border-brown-light/30 dark:border-cyber-purple/50 backdrop-blur-sm">
                        {successMessage && (
                            <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                                <CheckCircle size={20} className="mr-2" />
                                {successMessage}
                            </div>
                        )}

                        {errors.general && (
                            <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center">
                                <AlertTriangle size={20} className="mr-2" />
                                {errors.general}
                            </div>
                        )}

                        {/* Profile Settings */}
                        {activeTab === "profile" && (
                            <form onSubmit={handleProfileSubmit}>
                                <div className="flex items-center mb-6">
                                    <h2 className="text-2xl font-bold text-heading dark:text-cyber-cyan">Profile Settings</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2">
                                        <div className="flex flex-col sm:flex-row items-center mb-6 p-6 rounded-xl border border-brown-light/30 dark:border-cyber-cyan/30 bg-white/50 dark:bg-cyber-black/30">
                                            <div className="relative mb-4 sm:mb-0 sm:mr-6">
                                                <img
                                                    src={profileData.profile_pic || "/images/default-avatar.png"}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-accent/50 dark:border-cyber-cyan/60 shadow-md"
                                                />
                                                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent dark:bg-cyber-cyan flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                                    <Edit2 size={14} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                                    Profile Picture URL
                                                </label>
                                                <input
                                                    type="url"
                                                    name="profile_pic"
                                                    value={profileData.profile_pic}
                                                    onChange={handleProfileChange}
                                                    placeholder="https://example.com/profile.jpg"
                                                    className={`w-full p-3 rounded-xl border ${
                                                        theme === "dark"
                                                            ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                            : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                                    } focus:outline-none focus:ring-2 ${
                                                        errors.profile_pic ? "border-red-500" : ""
                                                    }`}
                                                />
                                                {errors.profile_pic && (
                                                    <p className="mt-2 text-sm text-red-500 flex items-center">
                                                        <AlertTriangle size={14} className="mr-1" />
                                                        {errors.profile_pic}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                            Name
                                        </label>
                                        <input
                                            name="name"
                                            type="text"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            className={`w-full p-3 rounded-xl border ${
                                                theme === "dark"
                                                    ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                    : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                            } focus:outline-none focus:ring-2 ${
                                                errors.name ? "border-red-500" : ""
                                            }`}
                                        />
                                        {errors.name && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertTriangle size={14} className="mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                            Email
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            className={`w-full p-3 rounded-xl border ${
                                                theme === "dark"
                                                    ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                    : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                            } focus:outline-none focus:ring-2 ${
                                                errors.email ? "border-red-500" : ""
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertTriangle size={14} className="mr-1" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            rows={4}
                                            className={`w-full p-3 rounded-xl border ${
                                                theme === "dark"
                                                    ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                    : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                            } focus:outline-none focus:ring-2 ${
                                                errors.bio ? "border-red-500" : ""
                                            }`}
                                            placeholder="Tell us a bit about yourself..."
                                        />
                                        {errors.bio && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertTriangle size={14} className="mr-1" />
                                                {errors.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark dark:bg-cyber-cyan dark:text-cyber-black dark:hover:bg-cyber-cyan/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-cyber-cyan disabled:opacity-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-accent/20 dark:hover:shadow-cyber-cyan/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Password Settings */}
                        {activeTab === "password" && (
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="flex items-center mb-6">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-accent to-accent-light dark:from-cyber-pink dark:to-cyber-purple rounded-full mr-4"></div>
                                    <h2 className="text-2xl font-bold text-heading dark:text-cyber-cyan">Change Password</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            name="current_password"
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            className={`w-full p-3 rounded-xl border ${
                                                theme === "dark"
                                                    ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                    : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                            } focus:outline-none focus:ring-2 ${
                                                errors.current_password ? "border-red-500" : ""
                                            }`}
                                        />
                                        {errors.current_password && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertTriangle size={14} className="mr-1" />
                                                {errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                                New Password
                                            </label>
                                            <input
                                                name="password"
                                                type="password"
                                                value={passwordData.password}
                                                onChange={handlePasswordChange}
                                                className={`w-full p-3 rounded-xl border ${
                                                    theme === "dark"
                                                        ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                        : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                                } focus:outline-none focus:ring-2 ${
                                                    errors.password ? "border-red-500" : ""
                                                }`}
                                            />
                                            {errors.password && (
                                                <p className="mt-2 text-sm text-red-500 flex items-center">
                                                    <AlertTriangle size={14} className="mr-1" />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-textLight dark:text-cyber-cyan mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                name="password_confirmation"
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={handlePasswordChange}
                                                className={`w-full p-3 rounded-xl border ${
                                                    theme === "dark"
                                                        ? "bg-cyber-dark/70 border-cyber-cyan/30 text-textDark focus:ring-cyber-cyan"
                                                        : "bg-white border-brown-light/40 text-textLight focus:ring-accent"
                                                } focus:outline-none focus:ring-2 ${
                                                    errors.password_confirmation ? "border-red-500" : ""
                                                }`}
                                            />
                                            {errors.password_confirmation && (
                                                <p className="mt-2 text-sm text-red-500 flex items-center">
                                                    <AlertTriangle size={14} className="mr-1" />
                                                    {errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark dark:bg-cyber-cyan dark:text-cyber-black dark:hover:bg-cyber-cyan/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-cyber-cyan disabled:opacity-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-accent/20 dark:hover:shadow-cyber-cyan/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} className="mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Danger Zone */}
                        {activeTab === "danger" && (
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-4"></div>
                                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
                                </div>

                                <div className="p-6 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 mb-6">
                                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                                        <AlertTriangle size={20} className="mr-2" />
                                        Delete Account
                                    </h3>
                                    <p className="mb-4 text-textLight dark:text-textDark">
                                        Once you delete your account, there is no going back. All your data will be
                                        permanently removed. Please be certain.
                                    </p>

                                    {!showDeleteConfirmation ? (
                                        <button
                                            onClick={() => setShowDeleteConfirmation(true)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 flex items-center"
                                        >
                                            <Trash2 size={18} className="mr-2" />
                                            Delete Account Permanently
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-red-600 dark:text-red-400 font-medium">
                                                Type "DELETE" to confirm account deletion:
                                            </p>
                                            <input
                                                type="text"
                                                value={deleteConfirmationText}
                                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                                className={`w-full p-3 rounded-xl border ${
                                                    theme === "dark"
                                                        ? "bg-cyber-dark/70 border-red-500/30 text-textDark focus:ring-red-500"
                                                        : "bg-white border-red-300 text-textLight focus:ring-red-500"
                                                } focus:outline-none focus:ring-2`}
                                                placeholder="Type DELETE"
                                            />
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleteConfirmationText !== "DELETE" || isLoading}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex-1 transition-all duration-300 flex items-center justify-center"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={18} className="mr-2" />
                                                            Confirm Deletion
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirmation(false);
                                                        setDeleteConfirmationText("");
                                                    }}
                                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex-1 transition-all duration-300 flex items-center justify-center"
                                                >
                                                    <X size={18} className="mr-2" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}