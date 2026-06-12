import re
import logging
from typing import List

logger = logging.getLogger(__name__)

class ResumeChunkingService:
    """Service to chunk resume text semantically while preserving section boundaries."""

    def __init__(self, chunk_size: int = 500, overlap: int = 100):
        """
        Args:
            chunk_size (int): Max character count for a chunk.
            overlap (int): Target overlap character count.
        """
        self.chunk_size = chunk_size
        self.overlap = overlap

        # Common resume section titles
        self.section_patterns = [
            r'^(?:professional\s+)?experience$',
            r'^work\s+history$',
            r'^education$',
            r'^skills?(?:\s+and\s+technologies)?$',
            r'^projects?$',
            r'^summary$',
            r'^objective$',
            r'^certifications?$',
            r'^publications?$',
            r'^awards?$',
            r'^languages?$',
            r'^interests?$',
            r'^profile$'
        ]
        self.section_regex = re.compile(
            '|'.join(self.section_patterns),
            re.IGNORECASE
        )

    def _is_section_header(self, line: str) -> bool:
        line = line.strip()
        if not line:
            return False
        # Markdown headers (e.g. ## Experience)
        if line.startswith('#'):
            return True
        # Check against regex section patterns
        if self.section_regex.match(line):
            return True
        # All caps and relatively short line
        if line.isupper() and len(line) < 40:
            return True
        return False

    def chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """
        Chunks resume text. Tries to preserve section boundaries first.
        If a section is larger than chunk_size, splits it into paragraphs/sentences.
        """
        c_size = chunk_size if chunk_size is not None else self.chunk_size
        c_overlap = overlap if overlap is not None else self.overlap

        if not text:
            return []

        lines = text.split('\n')
        sections = []
        current_section = {"title": "Header/Summary", "lines": []}

        for line in lines:
            stripped = line.strip()
            if self._is_section_header(stripped):
                if current_section["lines"]:
                    sections.append(current_section)
                current_section = {"title": stripped, "lines": [line]}
            else:
                current_section["lines"].append(line)
        if current_section["lines"]:
            sections.append(current_section)

        chunks = []
        for section in sections:
            section_title = section["title"]
            section_text = '\n'.join(section["lines"]).strip()
            if not section_text:
                continue

            # If section text is smaller than chunk_size, keep it intact
            if len(section_text) <= c_size:
                chunks.append(f"[{section_title}]\n{section_text}")
                continue

            # Otherwise, split this section into sub-chunks with overlap
            # Split by double newlines (paragraphs) first
            paragraphs = re.split(r'\n\s*\n', section_text)
            current_chunk = []
            current_len = 0

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                # If paragraph itself is too large, split by sentences
                if len(para) > c_size:
                    # Save what we have in current_chunk
                    if current_chunk:
                        chunks.append(f"[{section_title}]\n" + '\n\n'.join(current_chunk))
                        current_chunk = []
                        current_len = 0

                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    sub_chunk = []
                    sub_len = 0
                    for sent in sentences:
                        sent = sent.strip()
                        if not sent:
                            continue
                        if sub_len + len(sent) > c_size:
                            if sub_chunk:
                                chunks.append(f"[{section_title}] (Cont.)\n" + ' '.join(sub_chunk))
                            # overlap implementation: keep the last few sentences
                            overlap_text = []
                            overlap_len = 0
                            for prev_sent in reversed(sub_chunk):
                                if overlap_len + len(prev_sent) < c_overlap:
                                    overlap_text.insert(0, prev_sent)
                                    overlap_len += len(prev_sent) + 1
                                else:
                                    break
                            sub_chunk = overlap_text + [sent]
                            sub_len = overlap_len + len(sent)
                        else:
                            sub_chunk.append(sent)
                            sub_len += len(sent) + 1
                    if sub_chunk:
                        chunks.append(f"[{section_title}] (Cont.)\n" + ' '.join(sub_chunk))
                else:
                    # Paragraph fits
                    if current_len + len(para) > c_size:
                        if current_chunk:
                            chunks.append(f"[{section_title}]\n" + '\n\n'.join(current_chunk))
                        # overlap implementation: keep last paragraph(s) that fit overlap
                        overlap_paras = []
                        overlap_len = 0
                        for prev_para in reversed(current_chunk):
                            if overlap_len + len(prev_para) < c_overlap:
                                overlap_paras.insert(0, prev_para)
                                overlap_len += len(prev_para) + 2
                            else:
                                break
                        current_chunk = overlap_paras + [para]
                        current_len = overlap_len + len(para)
                    else:
                        current_chunk.append(para)
                        current_len += len(para) + 2

            if current_chunk:
                chunks.append(f"[{section_title}]\n" + '\n\n'.join(current_chunk))

        return chunks
