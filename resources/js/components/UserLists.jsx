import { Link } from "react-router-dom"
import {
  Plus,
  Trophy,
  Check,
  X,
  List,
  Gamepad2,
  Calendar,
  Edit2,
  Trash2,
  Star,
  ChevronRight,
  Zap,
} from "lucide-react"

export default function UserLists({
  profileState,
  isOwnProfile,
  editState,
  setEditState,
  createList,
  updateList,
  deleteList,
  username,
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Botón Nueva Colección */}
      <div className="flex items-center justify-between">
        {isOwnProfile && !editState.isCreatingList && (
          <button
            onClick={() => setEditState((prev) => ({ ...prev, isCreatingList: true }))}
            className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2.5 sm:py-3
                       bg-brown-light/80 dark:bg-cyber-purple/20 text-brown-dark dark:text-cyber-cyan font-medium border border-brown/30 dark:border-cyber-purple/30
                       shadow-[4px_4px_0px_0px_#4b3832] dark:shadow-[4px_4px_0px_0px_#000] hover:bg-brown-light dark:hover:bg-cyber-purple/30 
                       active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                       transition-all duration-200 cursor-pointer text-sm sm:text-base"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="font-medium">New Collection</span>
          </button>
        )}
      </div>

      {/* Formulario Crear Lista */}
      {isOwnProfile && editState.isCreatingList && (
        <div className="bg-white/80 dark:bg-cyber-dark/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-brown-light/30 dark:border-cyber-cyan/30 shadow-lg">
          <h4 className="font-bold text-brown-dark dark:text-cyber-cyan mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <Trophy size={14} className="sm:w-4 sm:h-4 text-white" />
            </div>
            Create New Collection
          </h4>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              value={editState.newListName}
              onChange={(e) => setEditState((prev) => ({ ...prev, newListName: e.target.value }))}
              placeholder="Enter collection name"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/50 dark:bg-cyber-dark/40 border border-brown-light/30 dark:border-cyber-cyan/30 rounded-xl text-brown-dark dark:text-white placeholder-brown/50 dark:placeholder-cyber-cyan/50 focus:outline-none focus:ring-2 focus:ring-brown-dark dark:focus:ring-cyber-cyan focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              autoFocus
            />
            <div className="flex space-x-3 sm:space-x-4">
              <button
                onClick={createList}
                className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 bg-brown-dark hover:bg-brown-darker dark:bg-cyber-cyan dark:hover:bg-cyber-cyan/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setEditState({
                    isCreatingList: false,
                    newListName: "",
                    editingListId: null,
                    editingListName: "",
                  })
                }}
                className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 bg-brown-light/30 dark:bg-cyber-purple/20 text-brown-dark dark:text-gray-300 rounded-xl hover:bg-brown-light/40 dark:hover:bg-cyber-purple/30 transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Colecciones */}
      {profileState.userLists.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {profileState.userLists.map((list, index) => (
            <div
              key={list.id}
              className="group relative bg-white/80 dark:bg-cyber-dark/60 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden border border-brown-light/30 dark:border-cyber-cyan/30 hover:border-brown-dark/50 dark:hover:border-cyber-cyan/40 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header de la Colección */}
              <div className="relative p-4 sm:p-6 border-b border-brown-light/20 dark:border-cyber-cyan/20 bg-white/90 dark:bg-cyber-dark/70">
                {editState.editingListId === list.id ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <input
                      type="text"
                      value={editState.editingListName}
                      onChange={(e) =>
                        setEditState((prev) => ({ ...prev, editingListName: e.target.value }))
                      }
                      className="flex-1 px-3 sm:px-4 py-2 bg-white/50 dark:bg-cyber-dark/40 border border-brown-light/30 dark:border-cyber-cyan/30 rounded-lg text-brown-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brown-dark dark:focus:ring-cyber-cyan transition-all duration-300 text-sm sm:text-base"
                      autoFocus
                    />
                    <button
                      onClick={() => updateList(list.id)}
                      className="p-1.5 sm:p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="Save"
                    >
                      <Check size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditState((prev) => ({ ...prev, editingListId: null, editingListName: "" }))
                      }}
                      className="p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <List size={14} className="sm:w-4 sm:h-4 text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-brown-dark dark:text-cyber-cyan">
                          {list.name}
                        </h4>
                        {list.is_favorite === 1 && (
                          <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-medium">
                            ⭐ Favorites
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                        <div className="flex items-center space-x-1 text-brown-dark dark:text-cyber-cyan">
                          <Gamepad2 size={10} className="sm:w-3 sm:h-3" />
                          <span>{list.games?.length || 0} games</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                          <Calendar size={10} className="sm:w-3 sm:h-3" />
                          <span>
                            {list.created_at
                              ? new Date(list.created_at).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOwnProfile && !list.is_favorite && (
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => {
                            setEditState((prev) => ({
                              ...prev,
                              editingListId: list.id,
                              editingListName: list.name,
                            }))
                          }}
                          className="p-1.5 sm:p-2 bg-brown-light/20 dark:bg-cyber-purple/20 text-brown-dark dark:text-cyber-cyan hover:text-brown-darker dark:hover:text-cyber-pink hover:bg-brown-light/30 dark:hover:bg-cyber-purple/30 rounded-lg transition-all duration-300"
                          title="Edit collection"
                        >
                          <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteList(list.id)}
                          className="p-1.5 sm:p-2 bg-brown-light/20 dark:bg-cyber-purple/20 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-brown-light/30 dark:hover:bg-cyber-purple/30 rounded-lg transition-all duration-300"
                          title="Delete collection"
                        >
                          <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Showcase de Juegos */}
              <div className="p-4 sm:p-6">
                {list.games && list.games.length > 0 ? (
                  <>
                    <div className="relative mb-3 sm:mb-4">
                      <div className="relative rounded-lg p-4">
                        <div className="flex justify-start items-end space-x-1 sm:space-x-2 min-h-[120px] sm:min-h-[140px] relative">
                          {list.games.slice(0, 4).map((game) => (
                            <div 
  key={game.id} 
  className="relative group/game"
>
  <Link to={`/games/${game.slug}`} className="block">
    {/* Lomo */}
    <div className="relative w-8 sm:w-10 h-24 sm:h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-sm border border-slate-300 dark:border-slate-600 shadow-lg cursor-pointer overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center p-1">
        <div className="transform -rotate-90 origin-center">
          <h5 className="text-[0.6rem] sm:text-xs font-bold text-white text-center line-clamp-1 whitespace-nowrap max-w-[80px] sm:max-w-[100px] drop-shadow-lg">
            {game.name}
          </h5>
        </div>
      </div>
    </div>
  </Link>

  {/* Popup de información */}
  <div className="absolute left-1/2 -translate-x-1/2 -top-36 sm:-top-40 w-32 sm:w-40 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-600 opacity-0 group-hover/game:opacity-100 pointer-events-none transition-opacity duration-300 z-50">
    <img
      src={game.image_url || "/placeholder.svg?height=300&width=225"}
      alt={game.name}
      className="w-full h-24 sm:h-28 object-cover rounded-t-lg"
    />
    <div className="p-2">
      <h6 className="text-gray-900 dark:text-white text-xs font-bold line-clamp-2">
        {game.name}
      </h6>
      {game.rating && (
        <div className="flex items-center mt-1">
          <Star size={10} className="text-yellow-400 fill-current mr-1" />
          <span className="text-gray-700 dark:text-gray-200 text-xs">
            {game.rating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  </div>
</div>

                          ))}

                          {/* Slots vacíos */}
                          {Array.from({ length: Math.max(0, 4 - list.games.length) }).map((_, idx) => (
                            <div
                              key={`empty-${idx}`}
                              className="w-8 sm:w-10 h-24 sm:h-32 border-2 border-dashed border-gray-300/50 dark:border-gray-600/30 rounded-sm bg-gray-50/30 dark:bg-gray-900/10 flex items-center justify-center"
                            >
                              <div className="text-gray-400/60 dark:text-gray-500/40 text-xs transform -rotate-90">
                                Empty
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats de la colección */}
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-brown-light/10 dark:bg-cyber-purple/10 rounded-lg border border-brown-light/20 dark:border-cyber-purple/20">
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        {list.games.length > 4 && (
                          <div className="flex items-center space-x-1 text-brown dark:text-cyber-cyan text-xs sm:text-sm">
                            <Plus size={10} className="sm:w-3 sm:h-3" />
                            <span>{list.games.length - 4} more</span>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(list.id)}`}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-brown-dark/10 dark:bg-cyber-cyan/10 hover:bg-brown-dark/20 dark:hover:bg-cyber-cyan/20 border border-brown-dark/20 dark:border-cyber-cyan/20 text-brown-dark dark:text-cyber-cyan hover:text-white hover:bg-brown-dark dark:hover:bg-cyber-cyan rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium group/link"
                      >
                        <span>View All</span>
                        <ChevronRight
                          size={12}
                          className="sm:w-3.5 sm:h-3.5 group-hover/link:translate-x-1 transition-transform duration-300"
                        />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brown-light/20 dark:bg-cyber-cyan/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-brown-light/30 dark:border-cyber-cyan/30">
                      <List size={20} className="sm:w-6 sm:h-6 text-brown dark:text-cyber-cyan" />
                    </div>
                    <p className="text-brown-dark dark:text-cyber-cyan font-medium mb-1 text-sm sm:text-base">
                      Empty Collection
                    </p>
                    <p className="text-brown dark:text-cyber-cyan text-xs sm:text-sm">
                      Add games to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Estado vacío (ninguna colección creada)
        <div className="text-center py-12 sm:py-16 md:py-20">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-brown-light/20 dark:bg-cyber-cyan/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-brown-light/30 dark:border-cyber-cyan/30">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brown-light/30 dark:bg-cyber-cyan/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <List size={32} className="sm:w-10 sm:h-10 text-brown-dark dark:text-cyber-cyan" />
              </div>
            </div>
            <div className="absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brown-dark dark:bg-cyber-cyan rounded-full animate-ping"></div>
            <div className="absolute top-6 sm:top-8 right-1/2 transform translate-x-6 sm:translate-x-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-6 sm:-translate-x-8 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-700"></div>
          </div>
          <h4 className="text-2xl sm:text-3xl font-bold text-brown-dark dark:text-cyber-cyan mb-3 sm:mb-4">
            No Collections Yet
          </h4>
          <p className="text-brown dark:text-cyber-cyan mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
            {isOwnProfile
              ? "Create your first collection to organize your gaming library and showcase your favorite titles!"
              : "This player hasn't created any public collections to display."}
          </p>
          {isOwnProfile && (
            <button
              onClick={() => setEditState((prev) => ({ ...prev, isCreatingList: true }))}
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-brown-dark hover:bg-brown-darker dark:bg-cyber-cyan dark:hover:bg-cyber-cyan/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-sm sm:text-base"
            >
              <Zap size={18} className="sm:w-5 sm:h-5 mr-2" />
              Create First Collection
            </button>
          )}
        </div>
      )}
    </div>
  )
}
