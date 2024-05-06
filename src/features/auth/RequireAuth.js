import { useLocation, Navigate, Outlet } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useEffect, useState } from "react"

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation()
    const { roles, active } = useAuth()

    const isAuthenticated = roles.some(role => allowedRoles.includes(role)) && active

    // Render content based on authentication status
    const content = isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} />

    return content
}

export default RequireAuth