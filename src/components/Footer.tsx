'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faReact } from '@fortawesome/free-brands-svg-icons';

interface FooterProps {
  statsText?: string;
}

export default function Footer({ statsText }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {statsText || ''}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FontAwesomeIcon icon={faCode} className="text-blue-500 w-4 h-4" />
              <span>by Josh using</span>
              <FontAwesomeIcon icon={faReact} className="text-blue-500 w-4 h-4" />
            </div>
            <div className="flex gap-3">
              <a
                href="https://github.com/SalazarJosh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/joshuasalazar1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
