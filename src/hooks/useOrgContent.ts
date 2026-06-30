"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { OrgContent, OrgContentSection } from "@/lib/types";

const DEFAULT_CORE_VALUES = [
  { title: "Faith & Christian Commitment", body: "The Association is rooted in the Anglican Christian faith. Every activity, project, and relationship is guided by the teachings of Christ, prayer, worship, and the service of God." },
  { title: "Marriage & Family", body: "Mothers' Union upholds Christ's teaching on the sanctity of marriage and the importance of stable family life, working actively to promote, protect, and strengthen marriages and families." },
  { title: "Service & Volunteerism", body: "The Association is voluntary and non-profit making. Members are called to serve communities selflessly, helping those whose families have met with adversity." },
  { title: "Unity & Fellowship", body: "The Association fosters unity, love, and sisterhood among all members across all six Buganda Dioceses, and maintains fellowship with Mothers' Union members beyond Buganda." },
  { title: "Integrity & Accountability", body: "All funds and resources are managed with transparency. Financial transactions require joint signatures of the President, Treasurer, and Secretary." },
  { title: "Children & Youth Development", body: "Committed to nurturing the next generation — teaching Christian values, running Sunday schools, providing youth counselling, and operating educational institutions from infant level upward." },
  { title: "Empowerment & Sustainability", body: "The Association initiates development projects that improve members' living standards and enable the organisation to sustain itself financially and operationally." },
  { title: "Prayer & Worship", body: "A worldwide fellowship united in prayer, worship, and service forms the spiritual backbone of the Association's life and work." },
];

const PLACEHOLDER_CONTENT: Record<OrgContentSection, string> = {
  about:
    "Mothers' Union Buganda Association is the Buganda Diocese chapter of the worldwide Mothers' Union, a Christian charity dedicated to advancing the Christian religion in the sphere of marriage and family life. We unite Christian women in prayer, worship, and service — supporting marriages, nurturing families, and building Christ-centred communities through fellowship, education, counselling, and development projects across all six Buganda Dioceses.",
  vision:
    "To advance the Christian religion in the sphere of marriage and family life, fostering stable, God-centred families and communities across all Buganda Dioceses.",
  mission:
    "To unite Christian women in Buganda in prayer, worship and service; supporting marriages, nurturing families, and building Christ-centred communities through fellowship, education, counselling, and development projects.",
  coreValues: JSON.stringify(DEFAULT_CORE_VALUES),
};

export function useOrgContent() {
  const [content, setContent] = useState<Record<OrgContentSection, string>>(
    PLACEHOLDER_CONTENT
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "orgContent"));
        const next = { ...PLACEHOLDER_CONTENT };
        snap.docs.forEach((d) => {
          const data = d.data() as OrgContent;
          if (data.bodyText) {
            next[data.sectionType] = data.bodyText;
          }
        });
        setContent(next);
      } catch {
        // Keep placeholders on failure — never show a broken homepage
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { content, loading };
}
