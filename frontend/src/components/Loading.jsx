import { motion } from 'framer-motion';

function Loading({ message = "Analyzing with AI...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Animated Logo/Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center"
          >
            <span className="text-4xl">🛡️</span>
          </motion.div>

          {/* Animated Spinner */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
              />
            ))}
          </div>

          <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {message}
          </h3>
          <p className="text-slate-400 text-sm">This may take a few seconds...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex justify-center gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15
            }}
            className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
          />
        ))}
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

function LoadingOverlay({ message = "Analyzing with AI..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <Loading message={message} />
    </motion.div>
  );
}

export default Loading;
export { LoadingOverlay };
