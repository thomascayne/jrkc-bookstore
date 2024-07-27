// components/SafeHTML.tsx

import React from "react";

interface SafeHTMLProps {
  html: string;
}

const SafeHTML: React.FC<SafeHTMLProps> = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default SafeHTML;
