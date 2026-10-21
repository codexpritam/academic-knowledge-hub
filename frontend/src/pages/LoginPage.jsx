import React from 'react';
import Layout from '../components/layout/Layout';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Layout hideFooter>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
