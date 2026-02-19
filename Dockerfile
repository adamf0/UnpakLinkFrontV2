# Gunakan image Node.js 22.13.1 dengan Alpine sebagai base image
FROM node:22.13.1-alpine AS build

# Set working directory
WORKDIR /app

# Salin file package.json dan package-lock.json (atau yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

ARG VITE_SOURCE
ARG VITE_GOOGLE_KEY
ARG VITE_BASEAPI
ARG VITE_BASEURL

ENV VITE_SOURCE={VITE_SOURCE}
ENV VITE_GOOGLE_KEY={VITE_GOOGLE_KEY}
ENV VITE_BASEAPI={VITE_BASEAPI}
ENV VITE_BASEURL={VITE_BASEURL}

# Salin seluruh aplikasi ke dalam container
COPY . .

# Build aplikasi React (hasilnya di folder dist)
RUN npm run build

# Gunakan image Node.js 22.13.1 Alpine untuk menjalankan aplikasi
FROM node:22.13.1-alpine

# Install serve, untuk menjalankan build React secara langsung
RUN npm install -g serve

# Salin hasil build dari tahap sebelumnya ke dalam folder /dist di container
COPY --from=build /app/dist /dist

# Expose port yang akan digunakan (port 5173)
EXPOSE 5173

# Jalankan aplikasi menggunakan serve
CMD ["serve", "-s", "/dist", "-l", "5173"]