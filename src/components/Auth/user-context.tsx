"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

type User = {
  user_id: string;
  company_id: string;
  email: string;
  department?: string;
  isSuperAdmin: boolean;
  isCompanyAdmin?: boolean;
  isCustomer?: boolean;
  isManager?: boolean;
  managerProfile?: {
    manager_id?: string;
    assignedCategories?: string[];
    managerLevel?: string;
    canAssignCategories?: boolean;
    notificationPreferences?: any;
  };
  customerProfile?: {
    customer_id?: string;
    companyName?: string;
    customerType?: string;
    assignedManager?: any;
    preferences?: any;
  };
  roles: string[];
  permissions: string[];
  permissionGroups: string[];
  notifications?: any[];
  [key: string]: any;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
  isCompanyAdmin: () => boolean;
  isCustomer: () => boolean;
  isManager: () => boolean;
  loading: boolean;
  hasToken: boolean | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  const refreshUser = async () => {
    if (!isClient) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/auth/current-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update user with fresh data, replacing previous state
      const freshUser = (response.data as any).data as User;
      setUser(prevUser => ({
        ...prevUser,
        ...freshUser,
        // Ensure isSuperAdmin is properly set
        isSuperAdmin: freshUser.isSuperAdmin || false,
        // Ensure roles are unique
        roles: [...new Set(freshUser.roles || [])],
        // Ensure permissions are unique
        permissions: [...new Set(freshUser.permissions || [])],
        // Ensure permissionGroups are unique
        permissionGroups: [...new Set(freshUser.permissionGroups || [])]
      }));
    } catch (error: any) {
      console.error("Failed to refresh user:", error);
      // Check if it's a 401 (Unauthorized) or 403 (Forbidden) - token expired/invalid
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userRole");
        setUser(null);
        setHasToken(false);
        // Redirect to /auth/sign-in on token expiry
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isInitialized) return;
    
    const token = localStorage.getItem("token");
    setHasToken(!!token);
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userType");
          localStorage.removeItem("userRole");
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          setHasToken(false);
          // Redirect to /auth/sign-in on token expiry
          if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
          }
          return;
        }
        // Set basic user info from token immediately for faster redirects
        setUser({
          user_id: decoded.user_id,
          company_id: decoded.company_id,
          roles: [...new Set((decoded.roles || []) as string[])], // Ensure roles are unique
          permissions: [],
          permissionGroups: [],
          isSuperAdmin: decoded.isSuperAdmin || false, // Use actual value from token
          email: decoded.email || "",
        });
        // Mark as initialized immediately to allow redirects
        setIsInitialized(true);
        setLoading(false);
        // Fetch full user details in background
        refreshUser();
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userRole");
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        setHasToken(false);
        // Redirect to /auth/sign-in on token decode error
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
      }
    } else {
      setLoading(false);
      setIsInitialized(true);
      setHasToken(false);
    }
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn("User initialization timeout - forcing completion");
        setLoading(false);
        setIsInitialized(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [isClient, isInitialized]);

  const logout = () => {
    if (isClient) {
      localStorage.removeItem("token");
    }
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    // For customer users, allow basic permissions even if not loaded yet
    if (user.isCustomer) {
      const customerPermissions = ['orders.read', 'orders.create', 'products.read', 'invoices.read', 'notifications.read'];
      if (customerPermissions.includes(permission)) return true;
    }
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles?.includes(role) || false;
  };

  const isSuperAdmin = (): boolean => {
    return user?.isSuperAdmin || false;
  };

  const isCompanyAdmin = (): boolean => {
    return user?.isCompanyAdmin || false;
  };

  const isCustomer = (): boolean => {
    return user?.isCustomer || false;
  };

  const isManager = (): boolean => {
    return user?.isManager || false;
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        logout, 
        refreshUser, 
        hasPermission, 
        hasRole, 
        isSuperAdmin, 
        isCompanyAdmin,
        isCustomer,
        isManager,
        loading,
        hasToken
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}