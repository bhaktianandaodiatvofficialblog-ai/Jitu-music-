import React, { useState } from 'react';
import { X, Send, MessageCircle, User, Heart } from 'lucide-react';
import { Song, SongComment } from '../types/music';

interface CommentModalProps {
  song: Song | null;
  comments: SongComment[];
  onAddComment: (songId: string, userName: string, text: string) => void;
  onClose: () => void;
  language: 'or' | 'en';
}

export const CommentModal: React.FC<CommentModalProps> = ({
  song,
  comments,
  onAddComment,
  onClose,
  language,
}) => {
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');

  if (!song) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(song.id, userName, commentText);
    setCommentText('');
  };

  const songComments = comments.filter((c) => c.songId === song.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={song.posterUrl}
              alt={song.title}
              className="w-12 h-12 rounded-xl object-cover aspect-square border border-slate-700"
            />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100 line-clamp-1">
                {song.title}
              </h3>
              <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-0.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>
                  {songComments.length}{' '}
                  {language === 'or' ? 'ଟି ମନ୍ତବ୍ୟ (Comments)' : 'Comments'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 my-2 pr-1 no-scrollbar">
          {songComments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-xs font-medium">
                {language === 'or'
                  ? 'ପ୍ରଥମ ମନ୍ତବ୍ୟ ଦିଅନ୍ତୁ... (Be the first to comment)'
                  : 'No comments yet. Leave a comment!'}
              </p>
            </div>
          ) : (
            songComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-slate-950">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {comment.userName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-9 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800 space-y-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={language === 'or' ? 'ଆପଣଙ୍କ ନାମ (Your Name)' : 'Your Name (Optional)'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={language === 'or' ? 'ମନ୍ତବ୍ୟ ଲେଖନ୍ତୁ... (Write comment)' : 'Write a comment...'}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'or' ? 'ପଠାନ୍ତୁ' : 'Send'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
