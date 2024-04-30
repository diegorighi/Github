import { GitHubUser } from './GitHubUser.js';

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.tbody = this.root.querySelector('table tbody');
    this.load();
    this.onadd();
  }

  load() {
    this.entries = JSON.parse(
      localStorage.getItem('@github-favorities')) || [];
  }

  delete(user){
    this.entries = this.entries
        .filter(entry => entry !== user); 
    this.update();
    this.save();
  }

  save(){
    localStorage.setItem('@github-favorities', JSON.stringify(this.entries));
  }

  async add(username){

    // Nao permitir adicionar igual
    const exists = this.entries.find(entry => entry.login === String(username).toLowerCase().trim());
    
    try{

      if(exists) throw new Error('Usuário já adicionado')
      const user = await GitHubUser.search(username);
      console.log(user);
      if(user.login === undefined) throw new Error('Usuário não encontrado');

      // Sem quebrar o principio da imutabilidade
      this.entries = [user, ...this.entries];
      this.update();
      this.save();


    } catch(error){
      alert(error);
    }
    
  }
}

export class FavoritesView extends Favorites {

  constructor(root) {
    super(root);
  }

  onadd() {
    const addButton = this.root.querySelector('.search button');

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');


      this.add(value);

    }
  }

  update() {
    // Precisa remover todas as TRs antes de adicionar novamente
    this.removeAllTr(); 

    this.entries.forEach(entry => {

      // Precisa criar uma row antes de preencher com informações dinamicas 
      const row = this.createRow();

      row.querySelector('.user img').src = `
      https://github.com/${entry.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${entry.name}`;
      row.querySelector('.user a').href = `
      https://github.com/${entry.login}`;

      row.querySelector('.user p').textContent = entry.name;
      row.querySelector('.user span').textContent = entry.login;
      row.querySelector('.repositories').textContent = entry.public_repos;
      row.querySelector('.followers').textContent = entry.followers;
      
      // Adiciona evento de remover no botao
      row.querySelector('.remove').onclick = (event) => {
        const remove = confirm('Deseja remover?');

        if(remove) {
          this.delete(entry);
        }
      }

      this.tbody.append(row);
    });
  }

  createRow() {
    // O TR precisa ser criado pela DOM
    const tr = document.createElement('tr');

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/diegorighi.png" alt="Uma pessoa branca de cabelos claros com cores da bandeira da Italia atras">
      <a href="https://github.com/diegorighi" target="_blank">
        <p>Diego Righi</p>
        <span>diegorighi</span>
      </a>
    </td>
    <td class="repositories">

    </td>
    <td class="followers">

    </td>
    <td>
      <button class="remove">&times;</button>
    </td>
    `;

    // Precisa retornar o TR
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach(tr => {
        tr.remove();
      });
  }
}