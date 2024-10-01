import React, { useState, useEffect } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { buscaTodos, exclui } from '../services/dbservice';

const ListagemAvaliacaoIQE = ({ navigation }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [avaliadores, setAvaliadores] = useState([]);
  const [etes, setETEs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para armazenar a string de busca
  const [filteredAvaliacoes, setFilteredAvaliacoes] = useState([]); // Estado para armazenar avaliações filtradas

  useEffect(() => {
    loadAvaliacoes();
    loadAvaliadores();
    loadETEs();
  }, []);

  useEffect(() => {
    filterAvaliacoesByETE(); // Chama a função de filtro toda vez que a string de busca ou a lista de avaliações muda
  }, [searchQuery, avaliacoes]);

  async function loadAvaliacoes() {
    try {
      const data = await buscaTodos('avaliacaoiqe');
      if (Array.isArray(data)) {
        setAvaliacoes(data);
      } else {
        throw new Error('Dados retornados não são um array');
      }
    } catch (error) {
      console.error('Erro ao carregar Avaliações:', error);
      Alert.alert('Erro', 'Erro ao carregar Avaliações. Veja o console para mais detalhes.');
    }
  }

  async function loadAvaliadores() {
    try {
      const data = await buscaTodos('avaliadorinea');
      if (Array.isArray(data)) {
        setAvaliadores(data);
      } else {
        throw new Error('Dados retornados não são um array');
      }
    } catch (error) {
      console.error('Erro ao carregar Avaliadores:', error);
      Alert.alert('Erro', 'Erro ao carregar Avaliadores. Veja o console para mais detalhes.');
    }
  }

  async function loadETEs() {
    try {
      const data = await buscaTodos('ete');
      if (Array.isArray(data)) {
        setETEs(data);
      } else {
        throw new Error('Dados retornados não são um array');
      }
    } catch (error) {
      console.error('Erro ao carregar ETEs:', error);
      Alert.alert('Erro', 'Erro ao carregar ETEs. Veja o console para mais detalhes.');
    }
  }

  function filterAvaliacoesByETE() {
    if (searchQuery.trim() === '') {
      setFilteredAvaliacoes(avaliacoes); // Se o campo de busca estiver vazio, mostrar todas as avaliações
    } else {
      const filtered = avaliacoes.filter(avaliacao => {
        const ete = etes.find(e => e.CodETE === avaliacao.CodETE);
        return ete && ete.NomeETE.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredAvaliacoes(filtered);
    }
  }

  async function handleDeleteAvaliacao(avId) {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta Avaliação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await exclui('avaliacaoiqe', avId); 
              loadAvaliacoes(); 
            } catch (error) {
              console.error('Erro ao excluir Avaliação:', error);
              Alert.alert('Erro', 'Erro ao excluir Avaliação. Veja o console para mais detalhes.');
            }
          }
        }
      ]
    );
  }

  function handleEditAvaliacao(avaliacao) {
    navigation.navigate('CadastroAvaliacaoIQE', { avId: avaliacao.CodAval });
  }

  function getAvaliadorNome(codAvaliadorINEA) {
    const avaliador = avaliadores.find(av => av.CodAvaliador === codAvaliadorINEA);
    return avaliador ? avaliador.NomeAvaliador : 'N/A';
  }

  function getETENome(codETE) {
    const ete = etes.find(e => e.CodETE === codETE);
    return ete ? ete.NomeETE : 'N/A';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Avaliações de IQE cadastradas</Text>

      {/* Campo de busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome da ETE"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredAvaliacoes.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>Não há Avaliações correspondentes.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAvaliacoes}
          keyExtractor={(item) => item.CodAval ? item.CodAval.toString() : '0'}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text>{item.AnoBase ? item.AnoBase.toString() : 'N/A'} - {item.DataVistoria ? item.DataVistoria.toString() : 'N/A'}</Text>
                <Text>Avaliador: {getAvaliadorNome(item.CodAvaliadorINEA)}</Text>
                <Text>ETE: {getETENome(item.CodETE)}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditAvaliacao(item)}>
                  <Text style={styles.buttonText}>Atualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAvaliacao(item.CodAval)}>
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CadastroAvaliacaoIQE')}>
        <Text style={styles.buttonText}>Cadastrar Avaliação</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HomeScreen')}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#381704',
    marginTop: 90,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    width: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    height: 50,
    width: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#381704',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});

export default ListagemAvaliacaoIQE;

