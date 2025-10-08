import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export const authService = {
  async login(email, senha) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      const userData = {
        id: user.id,
        email: user.email,
        nome: user.nome,
      };

      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro ao fazer login' };
    }
  },

  async register(nome, email, senha) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'Email já cadastrado' };
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            nome,
            email,
            senha_hash: senhaHash,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const userData = {
        id: newUser.id,
        email: newUser.email,
        nome: newUser.nome,
      };

      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro ao criar conta' };
    }
  },

  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      const userData = {
        id: data.id,
        email: data.email,
        nome: data.nome,
      };

      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: 'Erro ao atualizar dados' };
    }
  },

  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nome')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, message: 'Erro ao buscar usuário' };
    }
  },
};
