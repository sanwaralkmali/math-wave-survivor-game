import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full py-4 text-center text-sm text-muted-foreground border-t bg-background font-cairo">
    <div className="container mx-auto">
      <p>
        Educational Game 2025 | Created for Educational purposes By{" "}
        <Link
          to="https://sanwaralkmali.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Salah Alkmali
        </Link>
      </p>
    </div>
  </footer>
);

export default Footer; 