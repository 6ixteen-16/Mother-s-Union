"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { OrgContentSection } from "@/lib/types";

const SECTIONS: OrgContentSection[] = ["about", "vision", "mission", "coreValues"];

const PLACEHOLDERS: Record<OrgContentSection, string> = {
  about:
    "[ABOUT US PLACEHOLDER] Mothers Union Buganda is the Buganda Diocese chapter of the worldwide Mothers Union, supporting women, children, and families through prayer, advocacy, and practical outreach.",
  vision:
    "[VISION PLACEHOLDER] A community where every woman, child, and family flourishes in faith, dignity, and love.",
  mission:
    "[MISSION PLACEHOLDER] To nurture strong Christian family life through prayer, advocacy, and hands-on community outreach across the Buganda Diocese.",
  coreValues: JSON.stringify([
    { title: "Faith & Christian Commitment", body: "The Association is rooted in the Anglican Christian faith. Every activity, project, and relationship is guided by the teachings of Christ, prayer, worship, and the service of God." },
    { title: "Marriage & Family", body: "Mothers' Union upholds Christ's teaching on the sanctity of marriage and the importance of stable family life, working actively to promote, protect, and strengthen marriages and families." },
    { title: "Service & Volunteerism", body: "The Association is voluntary and non-profit making. Members are called to serve communities selflessly, helping those whose families have met with adversity." },
    { title: "Unity & Fellowship", body: "The Association fosters unity, love, and sisterhood among all members across all six Buganda Dioceses, and maintains fellowship with Mothers' Union members beyond Buganda." },
    { title: "Integrity & Accountability", body: "All funds and resources are managed with transparency. Financial transactions require joint signatures of the President, Treasurer, and Secretary." },
    { title: "Children & Youth Development", body: "Committed to nurturing the next generation — teaching Christian values, running Sunday schools, providing youth counselling, and operating educational institutions from infant level upward." },
    { title: "Empowerment & Sustainability", body: "The Association initiates development projects that improve members' living standards and enable the organisation to sustain itself financially and operationally." },
    { title: "Prayer & Worship", body: "A worldwide fellowship united in prayer, worship, and service forms the spiritual backbone of the Association's life and work." },
  ]),
};

export function useOrgContentEditor() {
  const { user } = useAuth();
  const [content, setContent] = useState<Record<OrgContentSection, string>>(
    PLACEHOLDERS
  );
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<OrgContentSection | null>(
    null
  );

  const reload = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "orgContent"));
      const next = { ...PLACEHOLDERS };
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.sectionType && data.bodyText) {
          next[data.sectionType as OrgContentSection] = data.bodyText;
        }
      });
      setContent(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function saveSection(section: OrgContentSection, bodyText: string) {
    setSavingSection(section);
    try {
      await setDoc(doc(db, "orgContent", section), {
        sectionType: section,
        bodyText,
        lastUpdated: Date.now(),
        updatedBy: user?.email || "unknown",
      });
      setContent((c) => ({ ...c, [section]: bodyText }));
    } finally {
      setSavingSection(null);
    }
  }

  return { content, loading, savingSection, saveSection, sections: SECTIONS };
}
