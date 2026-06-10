import { useEffect, useState } from "react";

const ONBOARDING_KEY = "closetly-onboarding-complete";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(
      ONBOARDING_KEY
    );

    setShowOnboarding(!completed);
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    completeOnboarding,
    isLoading,
  };
}