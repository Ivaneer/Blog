import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Fuse, { type FuseResult } from "fuse.js";

// Representa un post de blog con slug, título, descripción opcional y contenido
interface Post {
  slug: string;
  data: {
    title: string;
    description?: string;
  };
  body: string;
}

// Props que recibe el componente de búsqueda
interface SearchComponentProps {
  posts: Post[];
}

// Tipo de resultado que devuelve Fuse al buscar en los posts
type SearchResult = FuseResult<Post>;

const SearchComponent: React.FC<SearchComponentProps> = ({ posts }) => {
  // Detectar el sistema operativo
  const isMac = window.navigator.userAgent.toLowerCase().includes('mac');
  const shortcutLabel = isMac ? "⌘+K" : "Ctrl+K";

  // Estado con el término de búsqueda que escribe el usuario
  const [searchTerm, setSearchTerm] = useState("");
  // Estado con la lista de resultados filtrados por Fuse
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  // Estado para mostrar/ocultar el popup con resultados
  const [showResults, setShowResults] = useState(false);

  // Referencias a los inputs y al container del popup
  const inputRef = useRef<HTMLInputElement>(null);
  const popupInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Instancia de fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "data.title", weight: 0.4 },
          { name: "data.description", weight: 0.3 },
          { name: "body", weight: 0.3 },
        ],
        threshold: 0.3,
        includeMatches: true,
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
        findAllMatches: true,
      }),
    [posts]
  );

  // Devolver un fragmento de texto alrededor de la coincidencia
  const getMatchContext = (text: string, term: string, contextLength = 100) => {
    if (!text || !term) return "";
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    if (index === -1) return text.slice(0, contextLength) + "...";
    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(text.length, index + term.length + contextLength / 2);
    return `${start > 0 ? "..." : ""}${text.slice(start, end)}${
      end < text.length ? "..." : ""
    }`;
  };

  // Resaltar el término buscado
  const highlightText = (text: string, term: string) =>
    !term
      ? text
      : text.replace(
          new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
          '<mark class="bg-[#43D9AD] text-black rounded">$1</mark>'
        );

  // Limpiar búsqueda: resetea estados y quita el focus de inputs
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.blur();
    popupInputRef.current?.blur();
  }, []);

  // Búsqueda
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const raw = fuse.search(searchTerm);
      const needle = searchTerm.toLowerCase();
      setSearchResults(
        raw.filter((r) =>
          `${r.item.data.title} ${r.item.data.description ?? ""} ${
            r.item.body
          }`
            .toLowerCase()
            .includes(needle)
        )
      );
    } else setSearchResults([]);
  }, [searchTerm, fuse]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isShortcut =
        (isMac && e.metaKey && e.key.toLowerCase() === "k") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "k");
      if (isShortcut) {
        e.preventDefault();
        if (showResults) clearSearch();
        else if (searchTerm.length < 3) inputRef.current?.focus();
        else setShowResults(true);
      }
      if (e.key === "Escape" && showResults) {
        e.preventDefault();
        clearSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults, searchTerm, clearSearch, isMac]);

  // Focus en input popup
  useEffect(() => {
    if (showResults && popupInputRef.current)
      setTimeout(() => popupInputRef.current?.focus(), 0);
  }, [showResults]);

  // Click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showResults && popupRef.current && !popupRef.current.contains(e.target as Node))
        clearSearch();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults, clearSearch]);

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = showResults ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showResults]);

  return (
    <div className="mb-8 relative">
      <div className="relative max-w-2xl mx-auto search-container">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar en los posts..."
          className="w-full p-4 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#43D9AD] focus:border-transparent backdrop-blur-sm"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-400 border border-gray-400 rounded select-none cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {shortcutLabel}
        </div>
        {showResults && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm p-6 scrollbar">
            <div
              ref={popupRef}
              className="w-full max-w-4xl bg-[#0b0a0a]/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="relative p-4 border-b border-white/10 search-container">
                <input
                  ref={popupInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en los posts..."
                  className="w-full p-4 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#43D9AD] focus:border-transparent backdrop-blur-sm"
                />
                <svg
                  className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    clearSearch();
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div className="max-h-[70vh] overflow-y-auto">
                  {searchResults.map((result, i) => {
                    const { item, matches = [] } = result;
                    let contextText = "";
                    for (const match of matches) {
                      if (match.value) {
                        contextText =
                          match.key === "body"
                            ? getMatchContext(match.value, searchTerm)
                            : match.value;
                        break;
                      }
                    }
                    return (
                      <div
                        key={i}
                        className="p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer border-b border-white/5 last:border-b-0"
                        onClick={() => (window.location.href = `/blog/${item.slug}/`)}
                      >
                        <h3
                          className="text-[#43D9AD] font-semibold text-lg mb-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(item.data.title, searchTerm),
                          }}
                        />
                        {contextText && (
                          <p
                            className="text-sm text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(contextText, searchTerm),
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                searchTerm.length >= 3 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No se encontraron resultados</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
