import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import api from "../../../services/api";

const UserListTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  // Buscar usuários da API
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/usuarios");
      console.log("Resposta da API:", response.data);

      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError(response.data.error || "Erro ao carregar usuários");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError(error.response?.data?.error || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    setError("");
    setSuccess("");

    // Validações
    if (!newUser.nome || !newUser.email || !newUser.senha) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (newUser.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      const response = await api.post("/api/usuarios", newUser);

      if (response.data.success) {
        setSuccess("Usuário adicionado com sucesso!");
        setShowAddModal(false);
        setNewUser({ nome: "", email: "", senha: "" });
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.error || "Erro ao adicionar usuário");
      }
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      setError(error.response?.data?.error || "Erro ao conectar com o servidor");
    }
  };

  const handleDeleteUser = async () => {
    setError("");
    setSuccess("");

    try {
      const response = await api.delete(`/api/usuarios/${selectedUser._id}`);

      if (response.data.success) {
        setSuccess("Usuário deletado com sucesso!");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.error || "Erro ao deletar usuário");
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      setError(error.response?.data?.error || "Erro ao conectar com o servidor");
      setShowDeleteModal(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Lista de Usuários
        </h2>

        {/* Mensagens de Sucesso/Erro */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Barra de pesquisa */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botão Adicionar */}
          <button
            onClick={() => {
              setShowAddModal(true);
              setError("");
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Carregando usuários...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <UserCircleIcon className="h-16 w-16 mb-2" />
            <p>
              {searchTerm
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-150"
              >
                <div className="flex items-center gap-4">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{user.nome}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                    setError("");
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  title="Deletar usuário"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Adicionar Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowAddModal(false);
              setError("");
            }}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl w-[500px] p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Adicionar Usuário
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newUser.nome}
                  onChange={(e) =>
                    setNewUser({ ...newUser, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  value={newUser.senha}
                  onChange={(e) =>
                    setNewUser({ ...newUser, senha: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A senha deve ter no mínimo 6 caracteres
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl w-[450px] p-6 z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o usuário{" "}
              <span className="font-semibold">{selectedUser.nome}</span>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListTab;