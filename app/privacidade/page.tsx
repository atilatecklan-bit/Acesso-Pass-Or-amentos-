export const metadata = { title: "Política de privacidade" };

export default function Privacidade() {
  return (
    <main className="pagina-texto">
      <img src="/logo.png" alt="Acesso Pass" />
      <h1>Política de privacidade — Acesso Pass Orçamentos</h1>
      <p>Este sistema é de uso interno da equipe da Acesso Pass para criar e enviar propostas comerciais.</p>
      <h2>Dados que coletamos</h2>
      <p>
        Ao entrar com a conta Google, recebemos apenas seu nome, e-mail e foto de perfil. Eles servem para identificar quem
        acessa o sistema e quem criou ou alterou cada orçamento. Não acessamos e-mails, arquivos, contatos nem qualquer
        outro dado da sua conta Google.
      </p>
      <h2>Como usamos</h2>
      <p>
        Os dados ficam guardados no banco de dados do sistema e são usados só para controle de acesso e histórico de
        alterações. Não vendemos nem compartilhamos esses dados com terceiros.
      </p>
      <h2>Dados dos orçamentos</h2>
      <p>
        As informações de clientes e eventos cadastradas nos orçamentos pertencem à Acesso Pass e aos seus clientes, e são
        usadas apenas para elaborar e enviar as propostas.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a exclusão do seu acesso e dos seus dados a qualquer momento pelo e-mail{" "}
        <a href="mailto:atilatecklan@gmail.com">atilatecklan@gmail.com</a>.
      </p>
      <p className="mudo">Atualizada em 24/11/2026.</p>
    </main>
  );
}
