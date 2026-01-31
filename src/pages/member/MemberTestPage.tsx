import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const MemberTestPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const lang = (params.lang as string) || 'id';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("TestPage: Checking auth...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("TestPage: Session:", session ? "Found" : "Not found");
      
      if (!session) {
        console.log("TestPage: No session, redirecting to login");
        navigate(`/${lang}/login`);
        return;
      }
      
      console.log("TestPage: User authenticated:", session.user.email);
      setUser(session.user);
    } catch (error) {
      console.error("TestPage: Auth error:", error);
      navigate(`/${lang}/login`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading auth...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Member Test Page</h1>
      <p><strong>Status:</strong> ✅ Authenticated</p>
      <p><strong>User:</strong> {user?.email}</p>
      <p><strong>User ID:</strong> {user?.id}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate(`/${lang}/dashboard`)}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default MemberTestPage;
