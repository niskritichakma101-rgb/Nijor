import React from 'react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  // Generate Breadcrumb Schema Markup (JSON-LD)
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.url || window.location.origin
    }))
  };

  return (
    <nav className="flex items-center gap-2 text-[11px] text-slate-500 font-medium py-2.5 max-w-7xl mx-auto px-4" aria-label="Breadcrumb">
      {/* JSON-LD breadcrumb injection */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <span 
        onClick={() => window.location.href = '/'}
        className="cursor-pointer hover:text-emerald-700 transition font-bold"
      >
        হোম (Home)
      </span>
      
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <span className="text-slate-300 font-sans">/</span>
          {idx === items.length - 1 ? (
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-none">
              {item.label}
            </span>
          ) : (
            <span 
              onClick={item.onClick}
              className="cursor-pointer hover:text-emerald-700 transition"
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
