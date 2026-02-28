import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, Briefcase, BookOpen,
  Loader2, AlertCircle
} from "lucide-react";

// Firebase Imports
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Robust Lottie Import
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;

// Assets
import animationData from "../assets/loginScreen.json";
import gradientBgData from "../assets/Background 3d stroke.json";
import successAnimation from "../assets/succes.json";
import LogoPng from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLogo, setShowLogo] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Updated state: login uses email instead of username
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    role: "", 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    branch: "" // Added branch field
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setShowSuccess(false);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => {
    return email.endsWith('@slrtce.in');
  };

  // 🔥 FIREBASE LOGIN HANDLER
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginData.email, 
        loginData.password
      );
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }

      const userData = userDoc.data();

      // Store ONLY basic user info in localStorage (NO points)
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        role: userData.role,
        username: userData.username,
        branch: userData.branch || null
        // ❌ Points are NOT stored in localStorage - they will be fetched in real-time
      }));

      // Redirect based on role
      if (userData.role === "student") {
        navigate("/student");
      } else if (userData.role === "faculty") {
        navigate("/faculty");
      } else {
        throw new Error("Invalid user role");
      }

    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Invalid email or password";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    }
    
    setIsLoading(false);
  };

  // 🔥 FIREBASE SIGNUP HANDLER - WITH 100 POINTS
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateEmail(signupData.email)) {
      setErrors({ email: "Email must be from @slrtce.in domain" });
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    
    if (signupData.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    if (!signupData.role) {
      setErrors({ role: "Please select a role" });
      return;
    }

    if (!signupData.username) {
      setErrors({ username: "Username is required" });
      return;
    }

    // Branch validation for students
    if (signupData.role === "student" && !signupData.branch) {
      setErrors({ branch: "Please select your branch" });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signupData.email, 
        signupData.password
      );
      const user = userCredential.user;

      // Create user document in Firestore with 100 points
      const userData = {
        username: signupData.username,
        role: signupData.role,
        email: signupData.email,
        createdAt: new Date().toISOString(),
        uid: user.uid,
        
        // ✅ POINTS STORED IN FIREBASE (not localStorage)
        points: 100, // Give 100 points to new users
        
        // Track points history for transparency
        pointsHistory: [{
          amount: 100,
          type: 'signup_bonus',
          description: 'Welcome bonus for joining PrepStack',
          timestamp: new Date().toISOString()
        }],
        
        // Optional: Track totals
        totalPointsEarned: 100,
        totalPointsSpent: 0
      };

      // Add branch only for students
      if (signupData.role === "student") {
        userData.branch = signupData.branch;
      }

      // ✅ SAVE TO FIRESTORE (this is the source of truth)
      await setDoc(doc(db, "users", user.uid), userData);

      // Show success animation
      setShowSuccess(true);
      
      // Reset form and switch to login after success
      setTimeout(() => {
        setShowSuccess(false);
        setIsLogin(true);
        setSignupData({
          role: "", 
          username: "", 
          email: "", 
          password: "", 
          confirmPassword: "",
          branch: ""
        });
        setLoginData({ email: "", password: "" });
      }, 2000);

    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Signup failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak (minimum 6 characters)";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB] font-sans overflow-hidden relative px-6 py-6">
      
      {/* MAIN AUTH CARD */}
      <div className="relative z-10 flex w-full h-full max-w-[1700px] bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* LEFT BRANDING PANEL */}
        <div className="hidden md:flex md:w-[60%] relative bg-indigo-600 overflow-hidden">
          <div className="absolute inset-0">
            <Lottie 
              animationData={gradientBgData} 
              loop={true} 
              style={{ width: '100%', height: '100%' }} 
              rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
            />
          </div>
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-8 text-white text-center">
            <AnimatePresence mode="wait">
              {showLogo ? (
                <motion.div
                  key="logo-png"
                  initial={{ opacity: 0, scale: 0.4, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 0.8, filter: "blur(0px)" }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.1, 
                    filter: "blur(15px)",
                    transition: { duration: 0.4 } 
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                >
                  <img src={LogoPng} alt="Logo" className="w-32 h-32 object-contain" />
                </motion.div>
              ) : (
                <motion.div
                  key="brand-text"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                    }
                  }}
                >
                  <motion.h1 
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                    }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className="text-5xl font-bold tracking-tight mb-2"
                  >
                    PrepStack
                  </motion.h1>

                  <motion.div 
                    variants={{
                      hidden: { width: 0, opacity: 0 },
                      visible: { width: "190px", opacity: 1 }
                    }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="h-[2px] bg-white/40 mb-4 mx-auto" 
                  />

                  <motion.p 
                    variants={{
                      hidden: { opacity: 0, letterSpacing: "0.1em" },
                      visible: { opacity: 2, letterSpacing: "0.6em" }
                    }}
                    transition={{ duration: 1 }}
                    className="text-white/80 text-[11px] font-bold uppercase"
                  >
                    No More Searching.<br/>Just the Best Notes.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-14 bg-white/60 relative py-10 overflow-hidden ">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex flex-col items-center justify-center"
              >
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  style={{ width: 200, height: 200 }}
                />
                <h3 className="text-xl font-bold text-green-600 mt-4">Account Created Successfully!</h3>
                <p className="text-slate-500 text-sm mt-2">Redirecting to login...</p>
              </motion.div>
            ) : (
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full relative z-10"
              >
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                  {isLogin ? "Welcome Back" : "Join PrepStack"}
                </h2>
                <p className="text-slate-400 text-xs mb-8">
                  {isLogin ? "Sign in to your account" : "Create a new account"}
                </p>

                <form className="space-y-3" onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
                  {!isLogin && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="space-y-3"
                    >
                      {/* Role Selection */}
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16}/>
                        <select 
                          name="role"
                          value={signupData.role}
                          onChange={handleSignupChange}
                          className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none text-slate-800 ${errors.role ? 'border-red-400' : 'border-slate-100'}`}
                          required
                        >
                          <option value="" className="text-slate-400">Select Role</option>
                          <option value="student" className="text-slate-800">Student</option>
                          <option value="faculty" className="text-slate-800">Faculty</option>
                        </select>
                      </div>
                      {errors.role && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.role}</p>}

                      {/* Username */}
                      <FormInput 
                        name="username" 
                        placeholder="Username" 
                        icon={<User size={16}/>} 
                        value={signupData.username} 
                        onChange={handleSignupChange} 
                        error={errors.username} 
                        required
                      />

                      {/* Branch Selection - Only for students */}
                      {signupData.role === "student" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16}/>
                            <select 
                              name="branch"
                              value={signupData.branch}
                              onChange={handleSignupChange}
                              className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none text-slate-800 ${errors.branch ? 'border-red-400' : 'border-slate-100'}`}
                              required={signupData.role === "student"}
                            >
                              <option value="" className="text-slate-400">Select Branch</option>
                              <option value="computer_engineering" className="text-slate-800">Computer Engineering</option>
                              <option value="information_technology" className="text-slate-800">Information Technology</option>
                            </select>
                          </div>
                          {errors.branch && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.branch}</p>}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Email field - always show for both login and signup */}
                  <FormInput 
                    name={isLogin ? "email" : "email"}
                    placeholder={isLogin ? "Email (@slrtce.in)" : "Email (@slrtce.in)"}
                    icon={<Mail size={16}/>} 
                    value={isLogin ? loginData.email : signupData.email} 
                    onChange={isLogin ? handleLoginChange : handleSignupChange} 
                    error={errors.email}
                    required
                  />

                  <FormInput 
                    name="password" 
                    placeholder="Password" 
                    type="password"
                    icon={<Lock size={16}/>} 
                    value={isLogin ? loginData.password : signupData.password} 
                    onChange={isLogin ? handleLoginChange : handleSignupChange} 
                    error={errors.password} 
                    required
                  />

                  {!isLogin && (
                     <FormInput 
                      name="confirmPassword" 
                      placeholder="Confirm Password" 
                      type="password"
                      icon={<Lock size={16}/>} 
                      value={signupData.confirmPassword} 
                      onChange={handleSignupChange} 
                      error={errors.confirmPassword} 
                      required
                    />
                  )}

                  {errors.submit && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100"
                    >
                      <AlertCircle size={14} /> {errors.submit}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? "Sign In" : "Sign Up")}
                  </button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-[12px] -translate-y-5">
                  <button type="button" onClick={toggleAuth} className="text-indigo-600 font-bold hover:underline">
                    {isLogin ? "Create account" : "Login here"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INTERNAL LOTTIE - Only shows when isLogin is true and no success animation */}
          <AnimatePresence>
            {isLogin && !showSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                className="absolute bottom-[-185px] right-0 w-45 h-45 pointer-events-none z-0 opacity-40 md:opacity-100"
              >
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={{ width: '99%', height: '99%' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FormInput = ({ icon, error, required, ...props }) => (
  <div className="w-full group">
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-indigo-500'}`}>
        {icon}
      </div>
      <input 
        {...props}
        required={required}
        className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none transition-all text-slate-800 placeholder:text-slate-400 ${error ? 'border-red-400' : 'border-slate-100 focus:border-indigo-400 focus:bg-white'}`}
      />
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{error}</p>}
  </div>
);

export default Login;