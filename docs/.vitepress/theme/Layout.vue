<script setup>
import DefaultTheme from 'vitepress/theme'
import CustomFooter from './components/CustomFooter.vue'
import { useTabAnchors } from './useTabAnchors'

const { Layout } = DefaultTheme

useTabAnchors()
</script>

<template>
  <Layout>
    <template #layout-bottom>
      <CustomFooter />
    </template>
  </Layout>
</template>
