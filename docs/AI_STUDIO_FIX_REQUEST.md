# PROMPT FOR GOOGLE AI STUDIO
# COPY AND PASTE EVERYTHING BELOW THIS LINE
================================================================================

**Role**: You are a Senior UI/UX Designer and Frontend Architect. You specialize in "Scientific/Mission Control" interfaces using React and Tailwind CSS.

**Goal**: Fix, Polish, and "Sci-Fi-ify" the `IpCard` component.

## 1. The Situation
We have a dashboard called "OpsGuard" with a strict "Scientific Instrument" design language (Zinc, Cyan, Glassmorphism, Monospace Data).
The current `IpCard` component is functional but fragile (crashes if data is missing) and needs a visual polish to match the premium requirement.

## 2. Design Contract (Strict Rules)
*   **Theme**: `OpsGuard-Scientific`.
*   **Colors**: 
    *   Backgrounds: `bg-zinc-950` or `bg-black/40` (Glass).
    *   Accents: `text-cyan-400` (Brand), `text-red-500` (Error).
    *   Borders: `border-white/5` (Subtle).
*   **Typography**:
    *   Labels: Uppercase, `text-[10px]`, `tracking-widest`, `text-zinc-500`.
    *   Values: `font-mono` (JetBrains Mono equivalent).
*   **Safety**: The component MUST NOT crash if `data.connection`, `data.timezone`, or `data.region_code` are missing. Use defaults like "N/A" or "Unknown".

## 3. The Code to Fix (`IpCard.tsx`)
```tsx
import React from 'react';
import { IpData } from '../types';
import { InfoRow } from './InfoRow';
import { StatusBadge } from './StatusBadge';
import { Globe, MapPin, Network, Clock, ShieldCheck, ExternalLink, Crosshair } from 'lucide-react';

interface IpCardProps {
    data: IpData | null;
    loading: boolean;
    error: string | null;
    env: 'DEV' | 'PROD';
    history?: any[];
}

export const IpCard: React.FC<IpCardProps> = ({ data, loading, error, env }) => {
    // ... [See provided context for full code or assume standard implementation]
    const openMap = () => {
        if (data) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`, '_blank');
        }
    };

    if (loading) return <div className="text-cyan-500 animate-pulse font-mono">INITIALIZING SCAN...</div>; // Replace with Skeleton
    if (error) return <div className="text-red-500 font-mono">SIGNAL LOST: {error}</div>; // Replace with UI
    if (!data) return null;

    return (
        <div className="w-full max-w-md mx-auto rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
            {/* ... Content ... */}
             <InfoRow 
                label="ISP LINK" 
                value={data.connection?.isp || 'Unknown'} // Make this Robust!
                icon={<Network size={12} />} 
              />
        </div>
    );
};
```

## 4. Your Task
Refactor `IpCard.tsx` to be:
1.  **Visually Stunning**: Use the "Scientific" design tokens (Cyan glows, thin borders, monospace data).
2.  **Rock-Solid**: Handle ALL undefined properties safely (no optional chaining crashes).
3.  **Complete**: Return the FULL `IpCard.tsx` code ready to copy-paste.
