import React, { useState } from "react";

export interface AdvancedSearchParams {
  subject: string;
  from: string;
  after: string;
  before: string;
}

interface AdvancedSearchUIProps {
  onSearch: (params: AdvancedSearchParams) => void;
  loading?: boolean;
}

export default function AdvancedSearchUI({ onSearch, loading }: AdvancedSearchUIProps) {
  const [subject, setSubject] = useState("");
  const [from, setFrom] = useState("");
  const [after, setAfter] = useState("");
  const [before, setBefore] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const toggleAdvanced = () => setShowAdvanced((prev) => !prev);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ subject, from, after, before });
  };

  return (
    <form className="advanced-search-form" onSubmit={handleSubmit}>
      <div>
        <label>Subject: <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Order Confirmation" /></label>
      </div>
      <div>
        <label>From: <input value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g. amazon.com" /></label>
      </div>
      <div>
        <label>After (YYYY/MM/DD): <input value={after} onChange={e => setAfter(e.target.value)} placeholder="e.g. 2024/01/01" /></label>
      </div>
      <div>
        <label>Before (YYYY/MM/DD): <input value={before} onChange={e => setBefore(e.target.value)} placeholder="e.g. 2024/03/01" /></label>
      </div>
      <button type="submit" disabled={loading}>Search</button>
    </form>
  );
}
