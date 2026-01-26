/**
 * Out-of-Pocket Optimizer Page
 * 
 * DEPRECATED: This page content has been merged into My Actions.
 * This file redirects to /employee/my-actions for backwards compatibility.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OutOfPocketOptimizer() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to My Actions page where optimizer content now lives
    navigate('/employee/my-actions', { replace: true });
  }, [navigate]);

  return null;
}
